import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Gift, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { atminSelector } from '../store/reduxHook';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/overlay/Popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/overlay/Dialog';
import { Button } from '../components/ui/forms/Button';
import { ScrollArea } from '../components/ui/layout/ScrollArea';

// --- Types ---
export type NotificationType = 'promotion' | 'system' | 'alert' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string; // e.g. "/orders" - prefix will be auto-added based on role
  actionData?: any;
  actionText?: string;
}

// --- Mock Data ---
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '🎉 Ưu đãi đặc biệt mùa hè',
    message: 'Giảm ngay 20% cho tất cả đơn hàng từ 10 triệu đồng. Nhấn "Nhận ưu đãi" để tự động áp dụng mã giảm giá vào đơn hàng tiếp theo của bạn.',
    type: 'promotion',
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/orders', 
    actionData: { discountCode: 'SUMMER20', prefill: true },
    actionText: 'Nhận ưu đãi ngay'
  },
  {
    id: 'notif-2',
    title: '⚠️ Lịch bảo trì hệ thống',
    message: 'Hệ thống sẽ tạm ngừng hoạt động để nâng cấp vào lúc 00:00 - 02:00 ngày mai. Vui lòng lưu lại công việc đang dang dở.',
    type: 'system',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'notif-3',
    title: 'Đơn hàng #ORD-001 đã hoàn thành',
    message: 'Đơn hàng của đối tác B2B Vingroup đã được giao thành công.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    actionUrl: '/orders',
    actionText: 'Xem chi tiết đơn'
  }
];

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'promotion':
      return <Gift className="text-pink-500" size={20} />;
    case 'system':
      return <Info className="text-blue-500" size={20} />;
    case 'alert':
      return <AlertTriangle className="text-amber-500" size={20} />;
    case 'success':
      return <CheckCircle2 className="text-emerald-500" size={20} />;
    default:
      return <Bell className="text-muted-foreground" size={20} />;
  }
};

export function NotificationMenu() {
  const navigate = useNavigate();
  const { userRole } = atminSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read when clicked
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setSelectedNotif(notif);
    setIsModalOpen(true);
    setIsPopoverOpen(false); // Close dropdown
  };

  const handleAction = () => {
    if (selectedNotif?.actionUrl) {
      setIsModalOpen(false);
      let finalUrl = selectedNotif.actionUrl;
      // Auto assign prefix based on role
      if (finalUrl.startsWith('/')) {
        const prefix = (userRole === 'admin' || userRole === 'staff') ? '/admin' : 
                       (userRole === 'agent') ? '/b2b' : '/b2c';
        finalUrl = prefix + finalUrl;
      }
      navigate(finalUrl, { state: selectedNotif.actionData });
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="relative p-2 rounded-full hover:bg-accent transition-colors">
            <Bell size={20} className="text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-destructive rounded-full border border-card" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-2xl border-border/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <h3 className="font-semibold text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Bell size={40} className="text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3 p-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 ${!notif.isRead ? 'bg-primary/5' : 'bg-transparent'}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-1 ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="p-2 border-t border-border bg-muted/20">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setIsPopoverOpen(false)}>
              Đóng
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-primary/10">
                {selectedNotif && getIconForType(selectedNotif.type)}
              </div>
              <DialogTitle className="text-xl">{selectedNotif?.title}</DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed text-foreground/80 pt-2">
              {selectedNotif?.message}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="sm:justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {selectedNotif?.actionText ? 'Đóng' : 'Đã hiểu'}
            </Button>
            {selectedNotif?.actionText && (
              <Button onClick={handleAction} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {selectedNotif.actionText}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
