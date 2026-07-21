import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatApi } from '../api/chat.api';
import { MessageDTO, MessageRequest } from '../types';

interface UseChatOptions {
  token: string | null;
  conversationId: string | null;
  onAdminUpdate?: () => void;
  onNewMessage?: (msg: MessageDTO) => void;
  isViewing?: boolean; // True nếu người dùng đang thực sự mở khung chat/hộp thư
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export function useChatWebSocket({ token, conversationId, onAdminUpdate, onNewMessage, isViewing = true, userId, userName, userAvatar }: UseChatOptions) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const typingSubRef = useRef<StompSubscription | null>(null);
  const readSubRef = useRef<StompSubscription | null>(null);
  const isViewingRef = useRef(isViewing);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  const typingTimeoutsRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  const markAsReadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onNewMessageRef = useRef(onNewMessage);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  const triggerMarkAsRead = useCallback((convId: string) => {
    if (markAsReadTimeout.current) clearTimeout(markAsReadTimeout.current);
    markAsReadTimeout.current = setTimeout(() => {
      chatApi.markAsRead(convId).catch(err => console.error("Mark as read failed:", err));
    }, 1000);
  }, []);

  useEffect(() => {
    isViewingRef.current = isViewing;
  }, [isViewing]);

  // Load history when conversation changes
  useEffect(() => {
    if (conversationId && token) {
      chatApi.getMessages(conversationId).then(res => {
        if (res && res.data) {
          // Assuming API returns newest first (desc), we might need to reverse it for chat UI
          setHasMore(res.data.length >= 20);
          setMessages(res.data.reverse());
        }
      });
    } else {
      setMessages([]);
      setHasMore(true);
    }
  }, [conversationId, token]);

  // Optionally mark as read when viewing status changes to true
  useEffect(() => {
    if (conversationId && token && isViewing) {
      triggerMarkAsRead(conversationId);
    }
  }, [conversationId, token, isViewing, triggerMarkAsRead]);

  // Connect STOMP
  useEffect(() => {
    // Tạm thời vô hiệu hóa WebSocket vì Backend chưa code tính năng này
    // Tránh việc spam lỗi kết nối (CORS/401) lên console mỗi 5 giây
    // if (true) return;

    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-chat';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => console.log('STOMP: ', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      // If we have an active conversation, subscribe to it immediately after connecting
      if (conversationId) {
        subscribeToConversation(client, conversationId);
        
        // Fetch missed messages on reconnect
        chatApi.getMessages(conversationId).then(res => {
          if (res?.data) {
             const fetched = res.data.reverse();
             setMessages(prev => {
               const map = new Map(prev.map(m => [m.id, m]));
               fetched.forEach(m => map.set(m.id, m));
               return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
             });
          }
        }).catch(err => console.error("Failed to sync messages:", err));
      }
      if (onAdminUpdate) {
        client.subscribe('/topic/admin/conversations', () => {
          onAdminUpdate();
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [token]);

  // Handle subscription change when conversationId changes
  useEffect(() => {
    const client = clientRef.current;
    if (client && client.connected && conversationId) {
      subscribeToConversation(client, conversationId);
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (typingSubRef.current) {
        typingSubRef.current.unsubscribe();
        typingSubRef.current = null;
      }
      if (readSubRef.current) {
        readSubRef.current.unsubscribe();
        readSubRef.current = null;
      }
    };
  }, [conversationId]);

  const subscribeToConversation = (client: Client, convId: string) => {
    // Unsubscribe from previous if exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    if (typingSubRef.current) {
      typingSubRef.current.unsubscribe();
    }
    if (readSubRef.current) {
      readSubRef.current.unsubscribe();
    }
    
    subscriptionRef.current = client.subscribe(`/topic/conversation/${convId}`, (msg: IMessage) => {
      const newMsg: MessageDTO = JSON.parse(msg.body);
      
      if (onNewMessageRef.current) {
        onNewMessageRef.current(newMsg);
      }
      
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;

        // Replace optimistic message
        const tempIndex = prev.findIndex(m => m.id.startsWith('temp-') && m.content === newMsg.content);
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = newMsg;
          return updated;
        }

        return [...prev, newMsg];
      });

      // Acknowledge read if we are viewing it
      if (isViewingRef.current) {
        triggerMarkAsRead(convId);
      }
    });

    typingSubRef.current = client.subscribe(`/topic/conversation/${convId}/typing`, (msg: IMessage) => {
      const typingUserId = msg.body;
      if (typingUserId !== userId) {
        setTypingUsers(prev => {
          if (!prev.includes(typingUserId)) return [...prev, typingUserId];
          return prev;
        });

        if (typingTimeoutsRef.current[typingUserId]) {
          clearTimeout(typingTimeoutsRef.current[typingUserId]);
        }
        typingTimeoutsRef.current[typingUserId] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(id => id !== typingUserId));
          delete typingTimeoutsRef.current[typingUserId];
        }, 3000);
      }
    });

    readSubRef.current = client.subscribe(`/topic/conversation/${convId}/read`, (msg: IMessage) => {
      let readerId = "";
      try {
        const payload = JSON.parse(msg.body);
        readerId = payload.readerId;
      } catch (e) {
        readerId = msg.body.replace(/"/g, '');
      }
      
      setMessages(prev => prev.map(m => {
        if (m.senderId !== readerId && m.status !== "READ") {
          return { ...m, status: "READ" };
        }
        return m;
      }));
    });
  };

  const sendMessage = useCallback((content: string, contentType: "TEXT" | "IMAGE" | "FILE" = "TEXT", mediaUrl?: string) => {
    if (!clientRef.current || !clientRef.current.connected || !conversationId) return;

    const request: MessageRequest = {
      conversationId,
      content,
      contentType,
      mediaUrl
    };

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(request)
    });

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: MessageDTO = {
      id: tempId,
      conversationId,
      senderId: userId || "user",
      senderName: userName || "You",
      senderAvatar: userAvatar,
      content,
      contentType,
      mediaUrl,
      status: "SENT",
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
  }, [conversationId, userId, userName, userAvatar]);

  const sendTyping = useCallback(() => {
    if (!clientRef.current || !clientRef.current.connected || !conversationId) return;

    clientRef.current.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId })
    });
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (!conversationId || isLoadingMore || !hasMore || messages.length === 0) return;
    setIsLoadingMore(true);
    
    try {
      const oldestMessage = messages[0];
      if (oldestMessage.id.startsWith('temp-')) {
         setIsLoadingMore(false);
         return;
      }
      
      const res = await chatApi.getMessages(conversationId, oldestMessage.id);
      if (res?.data) {
        if (res.data.length < 20) {
          setHasMore(false);
        }
        if (res.data.length > 0) {
          const fetched = res.data.reverse();
          setMessages(prev => {
             const map = new Map();
             fetched.forEach(m => map.set(m.id, m));
             prev.forEach(m => map.set(m.id, m));
             return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });
        }
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, messages, isLoadingMore, hasMore]);

  return {
    messages,
    isConnected,
    sendMessage,
    setMessages, // Expose if we want to optimistically update UI
    hasMore,
    isLoadingMore,
    loadMore,
    typingUsers,
    sendTyping
  };
}
