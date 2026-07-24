package atmin.modules.order.service;

import atmin.modules.notification.api.NotificationInternalApi;
import atmin.modules.order.dto.OrderRequest;
import atmin.modules.order.dto.OrderResponse;
import atmin.modules.order.dto.OrderUpdateRequest;
import atmin.modules.order.entity.EmailStatus;
import atmin.modules.order.entity.ShippingStatus;
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
import atmin.modules.promotion.service.PromotionService;
import atmin.modules.promotion.dto.PromotionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;
import java.util.stream.Collectors;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.math.BigDecimal;
import java.time.LocalDate;
import atmin.modules.payment.dto.PaymentRequestDto;

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
    private final PromotionService promotionService;

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
        order.setShippingStatus(ShippingStatus.NOT_SHIPPED);
        order.setEstimatedDeliveryDate(LocalDate.now().plusDays(3));
        
        // Calculate total and prepare items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        List<String> productIds = request.getItems().stream()
                .map(OrderRequest.OrderItemDto::getProductId)
                .distinct()
                .collect(Collectors.toList());
        List<ProductDto> products = productInternalApi.getProductsByIds(productIds);
        Map<String, ProductDto> productMap = products.stream()
                .collect(Collectors.toMap(ProductDto::getId, p -> p));

        List<atmin.modules.product.api.StockUpdateDto> stockUpdates = new ArrayList<>();

        for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
            ProductDto product = productMap.get(itemDto.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found: " + itemDto.getProductId());
            }

            BigDecimal price = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(itemDto.getQuantity())));

            OrderItem orderItem = OrderItem.builder()
                    .orderId(order.getId())
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImageUrl(product.getImage())
                    .quantity(itemDto.getQuantity())
                    .price(price)
                    .selectedColor(itemDto.getSelectedColor())
                    .selectedSize(itemDto.getSelectedSize())
                    .build();
            orderItems.add(orderItem);

            // Chuẩn bị giảm số lượng tồn kho theo variant
            String variant = itemDto.getSelectedSize() + "-" + itemDto.getSelectedColor();
            stockUpdates.add(new atmin.modules.product.api.StockUpdateDto(product.getId(), variant, itemDto.getQuantity()));
        }

        productInternalApi.reduceStockBatch(stockUpdates);

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            try {
                PromotionDTO promotion = promotionService.validateVoucher(request.getVoucherCode(), totalAmount, user.getId());
                if (promotion.getDiscountAmount() != null) {
                    totalAmount = totalAmount.subtract(promotion.getDiscountAmount());
                } else if (promotion.getDiscountPercentage() != null) {
                    BigDecimal discount = totalAmount.multiply(BigDecimal.valueOf(promotion.getDiscountPercentage())).divide(BigDecimal.valueOf(100));
                    totalAmount = totalAmount.subtract(discount);
                }
                if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
                    totalAmount = BigDecimal.ZERO;
                }
                promotionService.useVoucher(request.getVoucherCode(), user.getId());
            } catch (Exception e) {
                log.warn("Không thể áp dụng mã giảm giá {}: {}", request.getVoucherCode(), e.getMessage());
                throw new RuntimeException("Mã giảm giá không hợp lệ: " + e.getMessage());
            }
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
            } catch (DataIntegrityViolationException e) {
                if (i == maxRetries - 1) {
                    throw new RuntimeException("Không thể tạo đơn hàng do trùng mã, vui lòng thử lại.", e);
                }
            }
        }
        
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(orderItems);
        order.setOrderItems(orderItems); // For email usage if needed immediately

        if (request.getPaymentMethod() == PaymentMethod.PAYOS) {
            PaymentRequestDto paymentReq = PaymentRequestDto.builder()
                    .orderCode(order.getOrderCode())
                    .amount(order.getTotalAmount())
                    .build();
            paymentUrl = paymentService.createPaymentLink(paymentReq);
        } else {
            orderEmailService.sendOrderConfirmationEmail(order, null);
        }

        return OrderResponse.fromEntity(order, paymentUrl, user.getFullName(), user.getEmail(), user.getPhoneNumber());
    }

    @Override
    @Transactional
    public void resendOrderEmail(String orderId, boolean isManual) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        populateOrderItems(order);
        
        if (isManual) {
            if (order.getEmailStatus() == EmailStatus.SENT) {
                throw new RuntimeException("Đơn hàng này đã được gửi email thành công rồi, không thể gửi lại.");
            }
        }

        try {
            if (order.getPaymentMethod() == PaymentMethod.COD) {
                if (isManual) {
                    orderEmailService.sendOrderConfirmationEmailSync(order, null);
                } else {
                    orderEmailService.sendOrderConfirmationEmail(order, null);
                }
            } else if (order.getPaymentMethod() == PaymentMethod.PAYOS && order.getStatus() != OrderStatus.PENDING_PAYMENT && order.getStatus() != OrderStatus.CANCELLED) {
                InvoiceDto invoice = paymentInternalApi.getInvoiceByOrderId(orderId);
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
        populateOrderItems(orders);
        
        List<OrderResponse> responses = new ArrayList<>();
        for (Order order : orders) {
            responses.add(OrderResponse.fromEntity(order, null, user.getFullName(), user.getEmail(), user.getPhoneNumber()));
        }
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        populateOrderItems(orders);
        
        List<String> userIds = orders.stream()
                .map(Order::getUserId)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
                
        Map<String, UserDto> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<UserDto> users = userInternalApi.getUsersByIds(userIds);
            for (UserDto u : users) {
                userMap.put(u.getId(), u);
            }
        }
        
        List<OrderResponse> responses = new ArrayList<>();
        for (Order order : orders) {
            UserDto u = userMap.get(order.getUserId());
            String cName = u != null ? u.getFullName() : "Unknown";
            String cEmail = u != null ? u.getEmail() : "";
            String cPhone = u != null ? u.getPhoneNumber() : order.getPhoneNumber();
            responses.add(OrderResponse.fromEntity(order, null, cName, cEmail, cPhone));
        }
        return responses;
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String username, String orderId) {
        UserDto user = userInternalApi.getUserByEmail(username);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        populateOrderItems(order);

        if (!order.getUserId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý (PENDING)");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        for (OrderItem item : order.getOrderItems()) {
            String variant = item.getSelectedSize() + "-" + item.getSelectedColor();
            productInternalApi.increaseStock(item.getProductId(), variant, item.getQuantity());
        }

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

        return OrderResponse.fromEntity(order, null, user.getFullName(), user.getEmail(), user.getPhoneNumber());
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(String orderId, OrderUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        populateOrderItems(order);
        
        if (request.getStatus() != null) {
            OrderStatus oldStatus = order.getStatus();
            OrderStatus newStatus = request.getStatus();
            
            if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.COMPLETED) {
                throw new RuntimeException("Không thể thay đổi trạng thái của đơn hàng đã hủy hoặc đã hoàn thành");
            }
            
            if (newStatus.ordinal() < oldStatus.ordinal() && newStatus != OrderStatus.CANCELLED) {
                throw new RuntimeException("Không thể lùi trạng thái đơn hàng");
            }
            
            if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
                for (OrderItem item : order.getOrderItems()) {
                    String variant = item.getSelectedSize() + "-" + item.getSelectedColor();
                    productInternalApi.increaseStock(item.getProductId(), variant, item.getQuantity());
                }
            }
            order.setStatus(newStatus);
        }
        if (request.getShippingStatus() != null) {
            order.setShippingStatus(request.getShippingStatus());
        }
        
        order = orderRepository.save(order);
        UserDto user = null;
        try {
            user = userInternalApi.getUserById(order.getUserId());
        } catch (Exception e) {
            log.warn("User not found for order {}", order.getId(), e);
        }
        
        String cName = user != null ? user.getFullName() : "Unknown";
        String cEmail = user != null ? user.getEmail() : "";
        String cPhone = user != null ? user.getPhoneNumber() : order.getPhoneNumber();
        
        return OrderResponse.fromEntity(order, null, cName, cEmail, cPhone);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getOrderCountsByUserIds(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Object[]> results = orderRepository.countOrdersByUserIds(userIds);
        Map<String, Long> map = new HashMap<>();
        for (Object[] result : results) {
            String userId = (String) result[0];
            Long count = (Long) result[1];
            map.put(userId, count);
        }
        return map;
    }

    private void populateOrderItems(Order order) {
        if (order != null) {
            order.setOrderItems(orderItemRepository.findByOrderId(order.getId()));
        }
    }

    private void populateOrderItems(List<Order> orders) {
        if (orders == null || orders.isEmpty()) return;
        List<String> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);
        Map<String, List<OrderItem>> itemsByOrderId = new HashMap<>();
        for (OrderItem item : allItems) {
            itemsByOrderId.computeIfAbsent(item.getOrderId(), k -> new ArrayList<>()).add(item);
        }
        for (Order order : orders) {
            order.setOrderItems(itemsByOrderId.getOrDefault(order.getId(), new ArrayList<>()));
        }
    }
}
