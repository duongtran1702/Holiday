import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { chatApi } from '../api/chat.api';
import { MessageDTO, MessageRequest } from '../types';

interface UseChatOptions {
  token: string | null;
  conversationId: string | null;
}

export function useChatWebSocket({ token, conversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // Load history when conversation changes
  useEffect(() => {
    if (conversationId && token) {
      chatApi.getMessages(conversationId).then(res => {
        if (res && res.data) {
          // Assuming API returns newest first (desc), we might need to reverse it for chat UI
          setMessages(res.data.reverse());
        }
      });
      // Optionally mark as read
      chatApi.markAsRead(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId, token]);

  // Connect STOMP
  useEffect(() => {
    // Tạm thời vô hiệu hóa WebSocket vì Backend chưa code tính năng này
    // Tránh việc spam lỗi kết nối (CORS/401) lên console mỗi 5 giây
    if (true) return;

    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
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
    };
  }, [conversationId]);

  const subscribeToConversation = (client: Client, convId: string) => {
    // Unsubscribe from previous if exists
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    subscriptionRef.current = client.subscribe(`/topic/conversation/${convId}`, (msg: IMessage) => {
      const newMsg: MessageDTO = JSON.parse(msg.body);
      setMessages(prev => [...prev, newMsg]);
      // Acknowledge read if we are viewing it
      chatApi.markAsRead(convId);
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
  }, [conversationId]);

  return {
    messages,
    isConnected,
    sendMessage,
    setMessages // Expose if we want to optimistically update UI
  };
}
