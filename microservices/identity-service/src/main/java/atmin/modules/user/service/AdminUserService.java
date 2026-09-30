package atmin.modules.user.service;

import atmin.modules.user.dto.CreateStaffRequest;

import java.util.List;
import atmin.modules.user.dto.CustomerResponseDTO;
import atmin.modules.user.dto.StaffResponseDTO;

public interface AdminUserService {
    void createStaff(CreateStaffRequest request);
    List<StaffResponseDTO> getAllStaffs();
    List<CustomerResponseDTO> getAllCustomers();
    void toggleUserStatus(String id);
    void updateStaffPermissions(String id, List<String> permissions);
}
