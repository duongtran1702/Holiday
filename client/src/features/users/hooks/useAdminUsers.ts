import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermSet, StaffMember } from "../../../core/types/index";
import { toast } from "sonner";
import { callApi } from "../../../core/utils/callApi";

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", phone: "", jobTitle: "" });
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | "Hoạt động" | "Tạm khóa">("Tất cả");

  const { data: staff = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const response = await callApi<any>("/admin/users/staff", "GET");
      if (response && response.data) {
        return response.data.map((u: any): StaffMember => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          phone: u.phoneNumber || "",
          jobTitle: "Nhân viên",
          status: u.status === "active" ? "Hoạt động" : "Tạm khóa",
          lastLogin: u.lastLogin || "Chưa đăng nhập",
          permissions: {
            products: { 
              view: u.permissions?.includes("VIEW_PRODUCTS") || false, 
              add: u.permissions?.includes("CREATE_PRODUCTS") || false, 
              edit: u.permissions?.includes("UPDATE_PRODUCTS") || false, 
              delete: u.permissions?.includes("DELETE_PRODUCTS") || false 
            },
            orders: { 
              view: u.permissions?.includes("VIEW_ORDERS") || false, 
              process: u.permissions?.includes("UPDATE_ORDERS") || false 
            },
            customers: { 
              view: u.permissions?.includes("VIEW_USERS") || false, 
              edit: u.permissions?.includes("UPDATE_USERS") || false 
            },
            settings: { 
              view: u.permissions?.includes("VIEW_SETTINGS") || false, 
              edit: u.permissions?.includes("UPDATE_SETTINGS") || false 
            }
          }
        }));
      }
      return [];
    }
  });

  const savePermsMutation = useMutation({
    mutationFn: async ({ id, perms }: { id: string, perms: PermSet }) => {
      const permList: string[] = [];
      if (perms.products.view) permList.push("VIEW_PRODUCTS");
      if (perms.products.add) permList.push("CREATE_PRODUCTS");
      if (perms.products.edit) permList.push("UPDATE_PRODUCTS");
      if (perms.products.delete) permList.push("DELETE_PRODUCTS");
      
      if (perms.orders.view) permList.push("VIEW_ORDERS");
      if (perms.orders.process) permList.push("UPDATE_ORDERS");
      
      if (perms.customers.view) permList.push("VIEW_USERS");
      if (perms.customers.edit) permList.push("UPDATE_USERS");
      
      if (perms.settings.view) permList.push("VIEW_SETTINGS");
      if (perms.settings.edit) permList.push("UPDATE_SETTINGS");
      
      return callApi(`/admin/users/${id}/permissions`, "PUT", permList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success("Cập nhật quyền thành công");
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật quyền");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => callApi(`/admin/users/${id}/status`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: () => {
      toast.error("Lỗi cập nhật trạng thái");
    }
  });

  const addStaffMutation = useMutation({
    mutationFn: async (staffData: any) => callApi("/admin/users/staff", "POST", staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success("Tạo tài khoản và gửi email thành công!");
      setNewStaff({ name: "", email: "", phone: "", jobTitle: "" });
      setShowAdd(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản");
    }
  });

  const handleSavePerms = async (id: string, perms: PermSet) => {
    savePermsMutation.mutate({ id, perms });
  };

  const handleToggleStatus = async (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleAddStaff = async () => {
    if (addStaffMutation.isPending) return;
    
    const name = newStaff.name.trim();
    if (!name || name.length < 2) {
      toast.error("Vui lòng nhập Họ và tên hợp lệ (ít nhất 2 ký tự).");
      return;
    }
    const email = newStaff.email.trim();
    if (!email) {
      toast.error("Vui lòng điền Email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Định dạng email không hợp lệ.");
      return;
    }

    const phone = newStaff.phone.trim();
    if (phone) {
      const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
      if (!phoneRegex.test(phone)) {
        toast.error("Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và có 10 chữ số).");
        return;
      }
    }

    addStaffMutation.mutate({
      fullName: name,
      email: email,
      ...(phone ? { phoneNumber: phone } : {})
    });
  };

  const filteredStaff = staff.filter((s: StaffMember) => statusFilter === "Tất cả" || s.status === statusFilter);

  return {
    staff,
    editTarget, setEditTarget,
    showAdd, setShowAdd,
    newStaff, setNewStaff,
    statusFilter, setStatusFilter,
    isSubmitting: addStaffMutation.isPending,
    isStaffLoading,
    handleSavePerms,
    handleToggleStatus,
    handleAddStaff,
    filteredStaff
  };
};
