package atmin.modules.order.repository;

import atmin.modules.order.entity.Order;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import atmin.modules.order.entity.OrderStatus;
import atmin.modules.order.entity.EmailStatus;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Optional<Order> findByOrderCode(Long orderCode);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt >= :startDate")
    long countByStatusAndCreatedAtAfter(OrderStatus status, LocalDateTime startDate);

    List<Order> findAll(Sort sort);

    List<Order> findByEmailStatus(EmailStatus emailStatus);

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT o.userId, COUNT(o) FROM Order o WHERE o.userId IN :userIds GROUP BY o.userId")
    List<Object[]> countOrdersByUserIds(@Param("userIds") List<String> userIds);
}
