
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <div className="p-4">กรุณาเข้าสู่ระบบ</div>;
  }
  
  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <User className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>
            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">ชื่อผู้ใช้</div>
              <div className="font-medium">{user.id}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">สิทธิ์การใช้งาน</div>
              <div className="font-medium">
                {user.role === 'admin' 
                  ? 'ผู้ดูแลระบบ (สามารถนำเข้าข้อมูล)'
                  : 'ผู้ใช้ทั่วไป (ไม่สามารถนำเข้าข้อมูล)'}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline"
            onClick={logout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
