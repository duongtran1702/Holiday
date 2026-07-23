import { callApi } from '../../../core/utils/callApi';

export interface Promotion {
  id: string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue: number;
  type: "PERCENT" | "FIXED";
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  targetType: "CUSTOMER" | "AGENT" | "SPECIFIC_EMAILS" | "ALL";
  status: "ACTIVE" | "INACTIVE";
}

export interface PromotionCreateReq {
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue: number;
  type: "PERCENT" | "FIXED";
  expiryDate?: string | null;
  usageLimit?: number | null;
  targetType: "CUSTOMER" | "AGENT" | "SPECIFIC_EMAILS" | "ALL";
  specificEmails?: string;
}

export interface UserVoucher {
  id: string;
  promotion: Promotion;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  createdAt: string;
}

export const promotionService = {
  // Admin
  getAllPromotions: () => {
    return callApi<Promotion[]>('/admin/promotions', 'GET');
  },

  createPromotion: (data: PromotionCreateReq) => {
    return callApi<Promotion>('/admin/promotions', 'POST', data);
  },

  // User
  getMyVouchers: () => {
    return callApi<UserVoucher[]>('/promotions/my-vouchers', 'GET');
  },

  deleteMyVoucher: (id: string) => {
    return callApi<void>(`/promotions/my-vouchers/${id}`, 'DELETE');
  },
};
