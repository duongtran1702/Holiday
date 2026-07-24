package atmin.modules.dashboard.controller;

import atmin.common.response.ApiResponse;
import atmin.modules.dashboard.api.DashboardResponse;
import atmin.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getMetrics() {
        DashboardResponse response = dashboardService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin dashboard thành công", response));
    }
}
