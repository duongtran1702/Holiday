package atmin.modules.user.service;

import atmin.modules.user.dto.CreateStaffRequest;

import java.util.List;
import atmin.modules.user.dto.StaffResponseDTO;

public interface AdminUserService {
    void createStaff(CreateStaffRequest request);
    List<StaffResponseDTO> getAllStaffs();
}
