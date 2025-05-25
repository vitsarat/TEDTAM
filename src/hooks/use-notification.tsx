import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: Date;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'คดีที่ต้องติดตาม',
    message: 'คุณมี 3 คดีที่ต้องติดตามภายใน 7 วัน',
    type: 'warning',
    date: new Date(),
    read: false,
  },
  {
    id: '2',
    title: 'เอกสารรอดำเนินการ',
    message: 'มีเอกสาร 2 ฉบับที่รอการลงนาม',
    type: 'info',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    title: 'การประชุมวันพรุ่งนี้',
    message: 'มีการประชุมกับลูกความเวลา 10:00 น.',
    type: 'info',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isVisible, setIsVisible] = useState(true); // เพิ่ม state เพื่อควบคุมการแสดงผล

  // นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
  const unreadCount = notifications.filter(n => !n.read).length;

  // เพิ่มการแจ้งเตือนใหม่ (จำกัดจำนวนสูงสุดที่ 5 เพื่อไม่ให้เยอะเกินไป)
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const newList = [newNotification, ...prev];
      return newList.slice(0, 5); // จำกัดจำนวนการแจ้งเตือนที่ 5
    });

    // แสดง toast เมื่อมีการแจ้งเตือนใหม่
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' :
               notification.type === 'success' ? 'success' :
               notification.type === 'warning' ? 'warning' : 'info',
    });
  };

  // ทำเครื่องหมายว่าอ่านแล้ว
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // ทำเครื่องหมายว่าอ่านทั้งหมด
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // ลบการแจ้งเตือน
  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // ซ่อน/แสดงการแจ้งเตือน
  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    isVisible,
    toggleVisibility,
  };
};