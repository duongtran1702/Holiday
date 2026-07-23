export type ConversationType = "DIRECT" | "GROUP";
export type MemberRole = "MEMBER" | "ADMIN";
export type ContentType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface MessageDTO {
    id: string; // From backend it's Long, mapped to string in JS
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    contentType: ContentType;
    mediaUrl?: string;
    replyToId?: string;
    status: MessageStatus;
    createdAt: string;
}

export interface ConversationDTO {
    id: string;
    type: ConversationType;
    name: string;
    avatarUrl?: string;
    participantId?: string;
    unreadCount: number;
    lastMessage?: MessageDTO;
    createdAt: string;
}

export interface MessageRequest {
    conversationId: string;
    content: string;
    contentType: ContentType;
    mediaUrl?: string;
    replyToId?: string;
}
