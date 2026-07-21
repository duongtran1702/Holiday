import { useState } from "react";
import { PermSet, StaffMember } from "../../../core/types/index";
import { defaultPerms, INITIAL_STAFF } from "../../../core/utils/mockData";
import { toast } from "sonner";
import { callApi } from "../../../core/utils/callApi";

export const useAdminUsers = () => {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", phone: "", jobTitle: "" });

  const [statusFilter, setStatusFilter] = useState<"Tất cả" | "Hoạt động" | "Tạm khóa">("Tất cả");

  const handleSavePerms = (id: string, perms: PermSet, meta: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...meta, permissions: perms } : s));
  };

  const handleToggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Hoạt động" ? "Tạm khóa" : "Hoạt động" } : s));
  };

  const handleAddStaff = async () => {
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
      await callApi("/admin/users/staff", "POST", {
        fullName: name,
        email: email,
        ...(phone ? { phoneNumber: phone } : {})
      });
      toast.success("Tạo tài khoản và gửi email thành công!");
      
      const s: StaffMember = {
        id: `ST-00${staff.length + 1}`, ...newStaff,
        status: "Hoạt động", lastLogin: "Chưa đăng nhập",
        permissions: defaultPerms(),
      };
      setStaff(prev => [...prev, s]);
      setNewStaff({ name: "", email: "", phone: "", jobTitle: "" });
      setShowAdd(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản");
    }
  };

  const filteredStaff = staff.filter(s => statusFilter === "Tất cả" || s.status === statusFilter);

  return {
    staff,
    editTarget, setEditTarget,
    showAdd, setShowAdd,
    newStaff, setNewStaff,
    statusFilter, setStatusFilter,
    handleSavePerms,
    handleToggleStatus,
    handleAddStaff,
    filteredStaff
  };
};
