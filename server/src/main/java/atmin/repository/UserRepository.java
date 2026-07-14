package atmin.repository;

import atmin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByEmailAndDeletedAtIsNull(String email);
    boolean existsByEmailAndDeletedAtIsNull(String email);
    boolean existsByPhoneNumberAndDeletedAtIsNull(String phoneNumber);

    @Query("SELECT u.passwordChangedAt FROM User u WHERE u.email = :username")
    Optional<LocalDateTime> findPasswordChangedAtByUsername(@Param("username") String username);

    Optional<User> findByResetToken(String resetToken);
}
