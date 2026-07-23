import { useState, useEffect } from "react";
import { PermSet, StaffMember } from "../../../core/types/index";
import { defaultPerms, INITIAL_STAFF } from "../../../core/utils/mockData";
import { toast } from "sonner";
import { callApi } from "../../../core/utils/callApi";

export const useAdminUsers = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", phone: "", jobTitle: "" });

  const [statusFilter, setStatusFilter] = useState<"Tất cả" | "Hoạt động" | "Tạm khóa">("Tất cả");

  const loadStaff = async () => {
    try {
      const response: any = await callApi("/admin/users/staff", "GET");
      if (response && response.data) {
        const mapped = response.data.map((u: any) => ({
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
        setStaff(mapped);
      }
    } catch (error: any) {
      console.error("Lỗi lấy danh sách nhân viên:", error);
      toast.error("Không thể tải danh sách nhân viên");
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSavePerms = (id: string, perms: PermSet, meta: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...meta, permissions: perms } : s));
  };

  const handleToggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Hoạt động" ? "Tạm khóa" : "Hoạt động" } : s));
  };

  const handleAddStaff = async () => {
    if (isSubmitting) return;
    
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

    try {
      setIsSubmitting(true);
      await callApi("/admin/users/staff", "POST", {
        fullName: name,
        email: email,
        ...(phone ? { phoneNumber: phone } : {})
      });
      toast.success("Tạo tài khoản và gửi email thành công!");
      
      await loadStaff(); // Reload the list instead of manual append
      setNewStaff({ name: "", email: "", phone: "", jobTitle: "" });
      setShowAdd(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(s => statusFilter === "Tất cả" || s.status === statusFilter);

  return {
    staff,
    editTarget, setEditTarget,
    showAdd, setShowAdd,
    newStaff, setNewStaff,
    statusFilter, setStatusFilter,
    isSubmitting,
    handleSavePerms,
    handleToggleStatus,
    handleAddStaff,
    filteredStaff
  };
};
