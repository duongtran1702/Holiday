import { callApi } from '../../../core/utils/callApi';
import { ConversationDTO, MessageDTO, ApiResponse } from '../../../core/types';

export const chatApi = {
    startConversation: () => {
        return callApi<ApiResponse<ConversationDTO>>('/chat/start', 'POST');
    },
    getMyConversations: () => {
        return callApi<ApiResponse<ConversationDTO[]>>('/chat/my-conversations', 'GET');
    },
    getAllConversations: () => {
        return callApi<ApiResponse<ConversationDTO[]>>('/chat/conversations', 'GET');
    },
    getMessages: (conversationId: string, cursor?: string, limit: number = 20) => {
        const params = cursor ? `?cursor=${cursor}&limit=${limit}` : `?limit=${limit}`;
        return callApi<ApiResponse<MessageDTO[]>>(`/chat/${conversationId}/messages${params}`, 'GET');
    },
    markAsRead: (conversationId: string) => {
        return callApi<ApiResponse<void>>(`/chat/${conversationId}/read`, 'POST');
    },
    sendBotReply: (conversationId: string, content: string) => {
        return callApi<ApiResponse<MessageDTO>>(`/chat/${conversationId}/bot-reply`, 'POST', { content, contentType: 'TEXT' });
    },
    getPresence: () => {
        return callApi<ApiResponse<string[]>>(`/chat/presence`, 'GET');
    }
};
