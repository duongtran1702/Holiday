package atmin.modules.order.service;

import atmin.modules.notification.api.NotificationInternalApi;
import atmin.modules.order.dto.OrderRequest;
import atmin.modules.order.dto.OrderResponse;
import atmin.modules.order.entity.EmailStatus;
import atmin.modules.order.entity.Order;
import atmin.modules.order.entity.OrderItem;
import atmin.modules.product.api.ProductDto;
import atmin.modules.user.api.UserDto;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.payment.entity.PaymentMethod;
import atmin.modules.order.repository.OrderItemRepository;
import atmin.modules.order.repository.OrderRepository;
import atmin.modules.product.api.ProductInternalApi;
import atmin.modules.user.api.UserInternalApi;
import atmin.modules.payment.service.PaymentService;
import atmin.modules.payment.api.PaymentInternalApi;
import atmin.modules.payment.api.InvoiceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductInternalApi productInternalApi;
    private final UserInternalApi userInternalApi;
    private final PaymentService paymentService;
    private final IOrderEmailService orderEmailService;
    private final PaymentInternalApi paymentInternalApi;
    private final NotificationInternalApi notificationInternalApi;

    @Override
    @Transactional
    public OrderResponse createOrder(String username, OrderRequest request) {
        UserDto user = userInternalApi.getUserByEmail(username);

        // Auto-save address and phone if not present or different
        userInternalApi.updateUserContactInfo(username, request.getPhoneNumber(), request.getShippingAddress());

        // Build Order
        Order order = new Order();
        order.setUserId(user.getId());
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setShippingStatus(atmin.modules.order.entity.ShippingStatus.NOT_SHIPPED);
        order.setEstimatedDeliveryDate(java.time.LocalDate.now().plusDays(3));
        
        // Calculate total and prepare items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
            ProductDto product = productInternalApi.getProductById(itemDto.getProductId());

            BigDecimal price = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(itemDto.getQuantity())));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImageUrl(product.getImage())
                    .quantity(itemDto.getQuantity())
                    .price(price)
                    .selectedColor(itemDto.getSelectedColor())
                    .selectedSize(itemDto.getSelectedSize())
                    .build();
            orderItems.add(orderItem);

            // Giảm số lượng tồn kho theo variant
            String variant = itemDto.getSelectedSize() + "-" + itemDto.getSelectedColor();
            productInternalApi.reduceStock(product.getId(), variant, itemDto.getQuantity());
        }

        order.setTotalAmount(totalAmount);
        
        String paymentUrl = null;

        if (request.getPaymentMethod() == PaymentMethod.PAYOS) {
            order.setStatus(OrderStatus.PENDING_PAYMENT);
        } else {
            order.setStatus(OrderStatus.PENDING);
        }
        
        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                long orderCode = System.currentTimeMillis() % 10000000000L * 100 + (long)(Math.random() * 100);
                order.setOrderCode(orderCode);
                order = orderRepository.save(order);
                break;
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                if (i == maxRetries - 1) {
                    throw new RuntimeException("Không thể tạo đơn hàng do trùng mã, vui lòng thử lại.", e);
                }
            }
        }
        
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        orderItemRepository.saveAll(orderItems);
        order.setOrderItems(orderItems); // For email usage if needed immediately

        if (request.getPaymentMethod() == PaymentMethod.PAYOS) {
            paymentUrl = paymentService.createPaymentLink(order);
        } else {
            orderEmailService.sendOrderConfirmationEmail(order, null);
        }

        return OrderResponse.fromEntity(order, paymentUrl);
    }

    @Override
    @Transactional
    public void resendOrderEmail(String orderId, boolean isManual) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        if (isManual) {
            if (order.getEmailStatus() == EmailStatus.SENT) {
                throw new RuntimeException("Đơn hàng này đã được gửi email thành công rồi, không thể gửi lại.");
            }
        }

        try {
            if (order.getPaymentMethod() == PaymentMethod.COD) {
                Hibernate.initialize(order.getOrderItems()); 
                if (isManual) {
                    orderEmailService.sendOrderConfirmationEmailSync(order, null);
                } else {
                    orderEmailService.sendOrderConfirmationEmail(order, null);
                }
            } else if (order.getPaymentMethod() == PaymentMethod.PAYOS && order.getStatus() != OrderStatus.PENDING_PAYMENT && order.getStatus() != OrderStatus.CANCELLED) {
                InvoiceDto invoice = paymentInternalApi.getInvoiceByOrderId(orderId);
                Hibernate.initialize(order.getOrderItems());
                if (isManual) {
                    orderEmailService.sendPaymentSuccessEmailSync(
                            order, invoice.getInvoiceNumber(), invoice.getIssuedDate(), 
                            invoice.getTotalAmount(), invoice.getTransactionReference()
                    );
                } else {
                    orderEmailService.sendPaymentSuccessEmail(
                            order, invoice.getInvoiceNumber(), invoice.getIssuedDate(), 
                            invoice.getTotalAmount(), invoice.getTransactionReference()
                    );
                }
            } else {
                throw new RuntimeException("Không thể gửi lại email cho đơn hàng ở trạng thái này.");
            }
            
            // If manual and sync succeeded, we update status and resolve notification
            if (isManual) {
                order.setEmailStatus(EmailStatus.SENT);
                orderRepository.save(order);
                notificationInternalApi.resolveNotification("ORDER_EMAIL_FAILED", "ORDER", orderId);
            }
            
        } catch (Exception e) {
            log.error("Failed to resend email: {}", e.getMessage());
            if (isManual) {
                // Return synchronous error for UI to show toast
                throw new RuntimeException("Gửi lại email thất bại: " + e.getMessage());
            }
        }
    }
    
    @Override
    @Transactional
    public int resendAllFailedEmails() {
        List<Order> failedOrders = orderRepository.findByEmailStatus(EmailStatus.FAILED);
        int successCount = 0;
        for (Order order : failedOrders) {
            try {
                resendOrderEmail(order.getId(), true);
                successCount++;
            } catch (Exception e) {
                log.error("Batch resend failed for order {}: {}", order.getId(), e.getMessage());
            }
        }
        return successCount;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String username) {
        UserDto user = userInternalApi.getUserByEmail(username);
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        List<OrderResponse> responses = new ArrayList<>();
        for (Order order : orders) {
            responses.add(OrderResponse.fromEntity(order, null));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        List<OrderResponse> responses = new ArrayList<>();
        for (Order order : orders) {
            responses.add(OrderResponse.fromEntity(order, null));
        }
        return responses;
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String username, String orderId) {
        UserDto user = userInternalApi.getUserByEmail(username);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        if (!order.getUserId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý (PENDING)");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        // Notify Admin
        notificationInternalApi.createNotification(
                "ORDER_CANCELLED_BY_CUSTOMER", 
                "ORDER",
                order.getId(),
                "Khách hàng hủy đơn",
                "Khách hàng đã tự hủy đơn hàng #" + order.getOrderCode(),
                "ALERT", 
                "ADMIN", 
                null, 
                "/admin/orders?id=" + order.getId(),
                null
        );

        return OrderResponse.fromEntity(order, null);
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(String orderId, atmin.modules.order.dto.OrderUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        if (request.getShippingStatus() != null) {
            order.setShippingStatus(request.getShippingStatus());
        }
        
        order = orderRepository.save(order);
        return OrderResponse.fromEntity(order, null);
    }
}
