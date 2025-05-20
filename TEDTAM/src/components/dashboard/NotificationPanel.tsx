import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useNotification, Notification } from '@/hooks/use-notification';
import { toast } from '@/hooks/use-toast';

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [visible, setVisible] = useState(true); // ควบคุมการแสดง/ซ่อนแถบวิ่ง
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0); // ดัชนีการแจ้งเตือนปัจจุบัน

  // เปลี่ยนการแจ้งเตือนทุก 5 วินาที
  useEffect(() => {
    if (notifications.length > 1 && unreadCount > 0 && visible) {
      const interval = setInterval(() => {
        setCurrentNotificationIndex((prevIndex) =>
          prevIndex === notifications.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // เปลี่ยนทุก 5 วินาที
      return () => clearInterval(interval);
    }
  }, [notifications, unreadCount, visible]);

  const handleMarkAsRead = (notification: Notification) => {
    markAsRead(notification.id);
    toast({
      title: "อ่านแล้ว",
      description: `"${notification.title}" ถูกทำเครื่องหมายว่าอ่านแล้ว`,
      variant: "success",
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
      toast({
        title: "อ่านทั้งหมดแล้ว",
        description: `${unreadCount} การแจ้งเตือนถูกทำเครื่องหมายว่าอ่านแล้ว`,
        variant: "success",
      });
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'error': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  // ถ้าไม่มีแจ้งเตือนที่ยังไม่ได้อ่าน หรือซ่อนแถบวิ่ง ให้คืนค่า null
  if (!visible || unreadCount === 0) {
    return null;
  }

  const currentNotification = notifications[currentNotificationIndex];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="relative flex items-center justify-between px-4 py-2">
        {/* แถบวิ่ง */}
        <div className="flex-1 overflow-hidden">
          <div className="marquee-wrapper">
            <div className="marquee">
              <span className="text-sm font-medium mr-2">
                {currentNotification.title}: {currentNotification.message}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(currentNotification.date, { 
                  addSuffix: true,
                  locale: th 
                })}
              </span>
              {!currentNotification.read && (
                <Badge variant="outline" className="ml-2">ยังไม่ได้อ่าน</Badge>
              )}
            </div>
          </div>
        </div>

        {/* ปุ่มอ่านแล้วและปิด */}
        <div className="flex items-center space-x-2">
          {!currentNotification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsRead(currentNotification)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              อ่านแล้ว
            </Button>
          )}
          {unreadCount > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              อ่านทั้งหมด ({unreadCount})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};