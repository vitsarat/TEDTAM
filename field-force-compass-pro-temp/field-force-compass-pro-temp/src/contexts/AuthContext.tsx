import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast as showToast } from 'react-toastify';

export type UserRole = 'admin' | 'user';

export type User = {
  id: string;
  role: UserRole;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS: Record<string, { password: string; role: UserRole; name: string }> = {
  admin: { password: '1234', role: 'admin', name: 'ผู้ดูแลระบบ' },
  user: { password: '1234', role: 'user', name: 'ผู้ใช้ทั่วไป' }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('tedtam_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem('tedtam_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tedtam_user');
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    const userInfo = USERS[username.toLowerCase()];
    
    if (userInfo && userInfo.password === password) {
      setUser({
        id: username,
        role: userInfo.role,
        name: userInfo.name
      });
      showToast.success(`ยินดีต้อนรับ ${userInfo.name}`);
      return true;
    }
    
    showToast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    return false;
  };

  const logout = () => {
    setUser(null);
    showToast.info('คุณได้ออกจากระบบแล้ว');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};