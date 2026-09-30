import { callApi } from '../utils/callApi';

export interface NotificationResponse {
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    title: string;
    message: string;
    severity: string;
    targetRole: string;
    actionUrl: string;
    metadata: any;
    isRead: boolean;
    isResolved: boolean;
    createdAt: string;
}

export interface NotificationListResponse {
    unresolvedCount: number;
    unreadCount: number;
    notifications: NotificationResponse[];
}

export const notificationApi = {
    getNotifications: () => {
        return callApi<NotificationListResponse>('/notifications', 'GET');
    },
    getMyNotifications: () => {
        return callApi<NotificationListResponse>('/notifications/my', 'GET');
    },
    markAsRead: (notificationIds: string[]) => {
        return callApi<void>('/notifications/read', 'PUT', { notificationIds });
    }
};
