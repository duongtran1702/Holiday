package atmin.modules.user.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.user.dto.AgentResponseDTO;
import atmin.modules.user.service.AdminAgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import atmin.modules.user.dto.UpdateCreditLimitRequestDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/agents")
@RequiredArgsConstructor
public class AdminAgentController {

    private final AdminAgentService adminAgentService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_AGENTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AgentResponseDTO>>> getAllAgents(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đại lý thành công", adminAgentService.getAllAgents(pageable)));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('UPDATE_AGENTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveAgent(@PathVariable String id) {
        adminAgentService.approveAgent(id);
        return ResponseEntity.ok(ApiResponse.success("Duyệt đại lý thành công", null));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('UPDATE_AGENTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectAgent(@PathVariable String id) {
        adminAgentService.rejectAgent(id);
        return ResponseEntity.ok(ApiResponse.success("Từ chối đại lý thành công", null));
    }

    @PatchMapping("/{id}/credit")
    @PreAuthorize("hasAuthority('UPDATE_AGENTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateCreditLimit(@PathVariable String id, @Valid @RequestBody UpdateCreditLimitRequestDTO request) {
        adminAgentService.updateCreditLimit(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hạn mức công nợ thành công", null));
    }
}
