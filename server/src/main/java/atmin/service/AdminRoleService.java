package atmin.service;

import atmin.controller.admin.dto.CreateRoleRequest;
import atmin.controller.admin.dto.PermissionDto;
import atmin.controller.admin.dto.RoleDto;

import java.util.List;

public interface AdminRoleService {
    List<PermissionDto> getAllPermissions();
    List<RoleDto> getAllRoles();
    RoleDto createRole(CreateRoleRequest request);
    RoleDto updateRole(String id, CreateRoleRequest request);
}
