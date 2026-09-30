package atmin.modules.user.service;

import atmin.modules.user.dto.CreateRoleRequest;
import atmin.modules.user.dto.PermissionDto;
import atmin.modules.user.dto.RoleDto;

import java.util.List;

public interface AdminRoleService {
    List<PermissionDto> getAllPermissions();
    List<RoleDto> getAllRoles();
    RoleDto createRole(CreateRoleRequest request);
    RoleDto updateRole(String id, CreateRoleRequest request);
}
