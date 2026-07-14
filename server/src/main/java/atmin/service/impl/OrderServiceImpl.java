package atmin.service.impl;

import atmin.controller.order.dto.OrderRequest;
import atmin.controller.order.dto.OrderResponse;
import atmin.entity.Order;
import atmin.entity.OrderItem;
import atmin.entity.Product;
import atmin.entity.User;
import atmin.entity.enums.OrderStatus;
import atmin.entity.enums.PaymentMethod;
import atmin.repository.OrderItemRepository;
import atmin.repository.OrderRepository;
import atmin.repository.ProductRepository;
import atmin.repository.UserRepository;
import atmin.service.OrderService;
import atmin.service.PaymentService;
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
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public OrderResponse createOrder(String username, OrderRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Auto-save address and phone if not present or different
        boolean userUpdated = false;
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
            user.setPhoneNumber(request.getPhoneNumber());
            userUpdated = true;
        }
        if (request.getShippingAddress() != null && !request.getShippingAddress().equals(user.getAddress())) {
            user.setAddress(request.getShippingAddress());
            userUpdated = true;
        }
        if (userUpdated) {
            userRepository.save(user);
        }

        // Build Order
        Order order = new Order();
        order.setUser(user);
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
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            double price = product.getPrice() != null ? product.getPrice() : 0.0;
            totalAmount += price * itemDto.getQuantity();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
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
        }

        return OrderResponse.fromEntity(order, paymentUrl);
    }
}
