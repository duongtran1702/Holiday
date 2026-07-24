package atmin.modules.user.repository;

import atmin.modules.user.entity.AgentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentProfileRepository extends JpaRepository<AgentProfile, String> {
    Optional<AgentProfile> findByUserIdAndDeletedAtIsNull(String userId);

    Page<AgentProfile> findAll(Pageable pageable);
}
