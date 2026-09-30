import { PermSet } from "../types";

export const PERMISSION_MODULES = [
  { key: "products", label: "Quản lý Sản phẩm", actions: ["view", "create", "update", "delete"] as const },
  { key: "inventory", label: "Quản lý Tồn kho", actions: ["view", "create", "update"] as const },
  { key: "orders", label: "Quản lý Đơn hàng B2C & B2B", actions: ["view", "create", "update", "delete"] as const },
  { key: "agents", label: "Quản lý Đại lý & Duyệt hồ sơ", actions: ["view", "create", "update", "delete"] as const },
  { key: "debts", label: "Quản lý Công nợ", actions: ["view", "update"] as const },
  { key: "promotions", label: "Tạo Mã Khuyến mãi (Voucher)", actions: ["view", "create", "update", "delete"] as const },
  { key: "reports", label: "Báo cáo Thống kê & Doanh thu", actions: ["view"] as const },
  { key: "inbox", label: "Hỗ trợ Khách hàng (Live Chat)", actions: ["view", "create"] as const },
];

export const defaultPerms = (): PermSet =>
  Object.fromEntries(
    PERMISSION_MODULES.map(module => [
      module.key,
      Object.fromEntries(module.actions.map(action => [action, false])),
    ]),
  );

export const permissionsToPermSet = (permissions: string[] = []): PermSet => {
  const permissionNames = new Set(permissions);
  return Object.fromEntries(
    PERMISSION_MODULES.map(module => [
      module.key,
      Object.fromEntries(
        module.actions.map(action => [
          action,
          permissionNames.has(`${action.toUpperCase()}_${module.key.toUpperCase()}`),
        ]),
      ),
    ]),
  );
};

export const permSetToPermissions = (permissions: PermSet): string[] =>
  PERMISSION_MODULES.flatMap(module =>
    module.actions
      .filter(action => permissions[module.key]?.[action])
      .map(action => `${action.toUpperCase()}_${module.key.toUpperCase()}`),
  );

export const allPermissions = (): PermSet =>
  Object.fromEntries(
    PERMISSION_MODULES.map(module => [
      module.key,
      Object.fromEntries(module.actions.map(action => [action, true])),
    ]),
  );
