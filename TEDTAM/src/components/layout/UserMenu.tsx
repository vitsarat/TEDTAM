
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const UserMenu = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-gray-500">
            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
          </p>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-500"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-1" />
        ออกจากระบบ
      </Button>
    </div>
  );
};

export default UserMenu;
