package atmin.modules.order.service;

import atmin.modules.order.dto.OrderRequest;
import atmin.modules.order.dto.OrderResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
        
        // Generate unique numeric order code based on timestamp + random to fit within 53 bits (PayOS limit)
        long orderCode = System.currentTimeMillis() % 10000000000L * 100 + (long)(Math.random() * 100);
        order.setOrderCode(orderCode);

        // Calculate total and prepare items
        double totalAmount = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
            ProductDto product = productInternalApi.getProductById(itemDto.getProductId());

            double price = product.getPrice() != null ? product.getPrice() : 0.0;
            totalAmount += price * itemDto.getQuantity();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemDto.getQuantity())
                    .price(price)
                    .selectedColor(itemDto.getSelectedColor())
                    .selectedSize(itemDto.getSelectedSize())
                    .build();
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        
        String paymentUrl = null;

        if (request.getPaymentMethod() == PaymentMethod.PAYOS) {
            order.setStatus(OrderStatus.PENDING_PAYMENT);
            order = orderRepository.save(order);
            orderItemRepository.saveAll(orderItems);
            
            // Create payment link via PayOS
            paymentUrl = paymentService.createPaymentLink(order);
        } else {
            // COD
            order.setStatus(OrderStatus.PENDING);
            order = orderRepository.save(order);
            orderItemRepository.saveAll(orderItems);
            
            // Send COD email
            orderEmailService.sendOrderConfirmationEmail(order, null);
        }

        return OrderResponse.fromEntity(order, paymentUrl);
    }
}
