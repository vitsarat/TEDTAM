
import React, { useState } from 'react';
import { AlertCircle, Bell, CheckCircle } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useNotification, Notification } from '@/hooks/use-notification';
import { toast } from '@/hooks/use-toast';

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Show toast when marking notification as read
    toast({
      title: "อ่านแล้ว",
      description: `"${notification.title}" ถูกทำเครื่องหมายว่าอ่านแล้ว`,
      variant: "success",
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
      
      // Show toast when marking all notifications as read
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full relative"
        >
          <Bell className="h-5 w-5 text-tedtam-blue" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-tedtam-orange text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>การแจ้งเตือน</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              อ่านทั้งหมด
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-0">
          <ScrollArea className="h-[calc(85vh-8rem)] rounded-md">
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-md border ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4' : ''} cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => !notification.read && handleMarkAsRead(notification)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs">
                        {formatDistanceToNow(notification.date, { 
                          addSuffix: true,
                          locale: th 
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    {!notification.read && (
                      <Badge variant="outline" className="mt-2">ยังไม่ได้อ่าน</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">ปิด</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
