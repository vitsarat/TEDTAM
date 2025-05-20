
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Define user roles
export type UserRole = 'admin' | 'user';

// Define user type
export type User = {
  id: string;
  role: UserRole;
  name: string;
};

// Define authentication context
type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined users (in a real app, this would be stored securely)
const USERS: Record<string, { password: string; role: UserRole; name: string }> = {
  admin: { password: '1234', role: 'admin', name: 'ผู้ดูแลระบบ' },
  user: { password: '1234', role: 'user', name: 'ผู้ใช้ทั่วไป' }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get stored user from localStorage on initial load
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('tedtam_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('tedtam_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tedtam_user');
    }
  }, [user]);

  // Login function
  const login = (username: string, password: string): boolean => {
    const userInfo = USERS[username.toLowerCase()];
    
    if (userInfo && userInfo.password === password) {
      setUser({
        id: username,
        role: userInfo.role,
        name: userInfo.name
      });
      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: `ยินดีต้อนรับ ${userInfo.name}`,
      });
      return true;
    }
    
    toast({
      title: 'เข้าสู่ระบบไม่สำเร็จ',
      description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      variant: 'destructive'
    });
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    toast({
      title: 'ออกจากระบบสำเร็จ',
      description: 'คุณได้ออกจากระบบแล้ว'
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
