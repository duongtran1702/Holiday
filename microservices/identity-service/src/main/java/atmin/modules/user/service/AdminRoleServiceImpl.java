package atmin.modules.user.service;

import atmin.common.exception.ResourceNotFoundException;
import atmin.modules.user.dto.CreateRoleRequest;
import atmin.modules.user.dto.PermissionDto;
import atmin.modules.user.dto.RoleDto;
import atmin.modules.user.entity.Permission;
import atmin.modules.user.entity.Role;
import atmin.modules.user.repository.PermissionRepository;
import atmin.modules.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRoleServiceImpl implements AdminRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream().map(p -> PermissionDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoleDto createRole(CreateRoleRequest request) {
        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .build();

        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return mapToDto(savedRole);
    }

    @Override
    @Transactional
    public RoleDto updateRole(String id, CreateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        role.setName(request.getName().toUpperCase());

        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        } else {
            role.setPermissions(new HashSet<>());
        }

        Role savedRole = roleRepository.save(role);
        return mapToDto(savedRole);
    }

    private RoleDto mapToDto(Role role) {
        List<PermissionDto> permissionDtos = role.getPermissions() != null ? 
            role.getPermissions().stream().map(p -> PermissionDto.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .build()).collect(Collectors.toList()) : List.of();

        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .permissions(permissionDtos)
                .build();
    }
}
