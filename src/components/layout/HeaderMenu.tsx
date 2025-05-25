
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HeaderMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get page title based on current route
  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const mainPath = pathSegments[0] || '';
    
    switch (mainPath) {
      case '':
        return 'หน้าหลัก';
      case 'customers':
        return 'ลูกค้า';
      case 'customer':
        if (pathSegments[1] === 'add') return 'เพิ่มลูกค้า';
        if (pathSegments[1] === 'edit') return 'แก้ไขลูกค้า';
        return 'ข้อมูลลูกค้า';
      case 'map':
        return 'แผนที่';
      case 'performance':
        return 'ผลการดำเนินงาน';
      case 'wallet':
        return 'การเงิน';
      case 'chat':
        return 'แชท';
      default:
        return 'TEDTAM CRM';
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 h-14 border-b">
      <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1.5"
        onClick={() => navigate('/profile')}
      >
        <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="h-4 w-4" />
        </span>
        <span className="font-medium">{user?.name}</span>
      </Button>
    </div>
  );
};

export default HeaderMenu;
