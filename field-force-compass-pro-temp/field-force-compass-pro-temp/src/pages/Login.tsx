
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Slight delay to simulate network request
    setTimeout(() => {
      login(username, password);
      setIsLoading(false);
    }, 500);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TEDTAM CRM</h1>
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อดำเนินการ</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="ชื่อผู้ใช้"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                บัญชีผู้ใช้: admin หรือ user
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="รหัสผ่าน"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                รหัสผ่าน: 1234
              </p>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 TEDTAM CRM. ระบบบริหารจัดการลูกค้าสำหรับนักกฎหมาย</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
