import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sun, Cloud, CloudRain } from "lucide-react";
import { toast as showToast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<'sun' | 'cloud' | 'rain'>('sun');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const weatherOptions: Array<'sun' | 'cloud' | 'rain'> = ['sun', 'cloud', 'rain'];
    const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    setWeather(randomWeather);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newValue = prev + 5;
        return newValue > 100 ? 100 : newValue;
      });
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour < 12) return "สวัสดีตอนเช้า";
    if (hour < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  if (!user) {
    return <div>กรุณาเข้าสู่ระบบ</div>;
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tedtam-blue">{getGreeting()}</h1>
          <p className="text-gray-600">คุณ{user.name}</p>
        </div>
      </div>

      <Card className="mb-4 overflow-hidden card-shadow">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            {weather === 'sun' && <Sun className="h-8 w-8 text-yellow-500 mr-3" />}
            {weather === 'cloud' && <Cloud className="h-8 w-8 text-gray-400 mr-3" />}
            {weather === 'rain' && <CloudRain className="h-8 w-8 text-blue-400 mr-3" />}
            <div>
              <p className="text-sm font-medium">สภาพอากาศวันนี้</p>
              <p className="text-xs text-gray-500">
                {weather === 'sun' && 'แดดจัด 32°C'}
                {weather === 'cloud' && 'มีเมฆมาก 29°C'}
                {weather === 'rain' && 'ฝนตก 27°C'}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {currentTime.toLocaleDateString('th-TH', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </CardContent>
      </Card>

      <Card className="mb-4 tedtam-gradient text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">ความคืบหน้างานวันนี้</h2>
            <span className="text-sm">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
          <div className="flex justify-between mt-4">
            <span className="text-xs">0%</span>
            <span className="text-xs">100%</span>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Button onClick={() => navigate('/customers')} className="w-full mb-2">รายชื่อลูกค้า</Button>
        <Button onClick={() => navigate('/map')} className="w-full mb-2">ดูแผนที่</Button>
        <Button onClick={() => navigate('/performance')} className="w-full mb-2">ประสิทธิภาพ</Button>
        <Button onClick={() => navigate('/wallet')} className="w-full mb-2">กระเป๋าเงิน</Button>
        <Button onClick={() => navigate('/chat')} className="w-full mb-2">แชท</Button>
        <Button onClick={() => navigate('/profile')} className="w-full mb-2">โปรไฟล์</Button>
        <Button onClick={logout} variant="destructive" className="w-full">ออกจากระบบ</Button>
      </div>

      <Button 
        className="fixed right-4 bottom-20 rounded-full w-14 h-14 bg-tedtam-orange hover:bg-tedtam-orange/90 shadow-lg flex items-center justify-center animate-pulse-soft"
        size="icon"
        onClick={() => {
          showToast.info("เลือกการทำงานที่ต้องการ");
        }}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Button>
    </div>
  );
};

export default Dashboard;