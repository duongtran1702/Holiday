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
    return callApi<Promotion[]>('/staff/promotions', 'GET');
  },

  createPromotion: (data: PromotionCreateReq) => {
    return callApi<Promotion>('/staff/promotions', 'POST', data);
  },

  updatePromotion: (id: string, data: PromotionCreateReq) => {
    return callApi<Promotion>(`/staff/promotions/${id}`, 'PUT', data);
  },

  deletePromotion: (id: string) => {
    return callApi<void>(`/staff/promotions/${id}`, 'DELETE');
  },

  togglePromotionStatus: (id: string) => {
    return callApi<void>(`/staff/promotions/${id}/status`, 'PATCH');
  },

  // User
  getMyVouchers: () => {
    return callApi<UserVoucher[]>('/promotions/my-vouchers', 'GET');
  },

  deleteMyVoucher: (id: string) => {
    return callApi<void>(`/promotions/my-vouchers/${id}`, 'DELETE');
  },

  validateCode: (code: string, totalAmount: number) => {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('totalAmount', totalAmount.toString());
    return callApi<{ data: Promotion, message: string }>(`/promotions/validate?${params.toString()}`, 'POST');
  },
};
