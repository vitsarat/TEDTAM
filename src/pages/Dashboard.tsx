import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight, Sun, Cloud, CloudRain } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { customerService } from "@/services/customerService";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { TaskTracker } from "@/components/dashboard/TaskTracker";
import { NotepadWidget } from "@/components/dashboard/NotepadWidget";

const Dashboard: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<'sun' | 'cloud' | 'rain'>('sun');

  // Get current user name (would come from auth in a real app)
  const userName = "ทีมงาน";
  
  // Get KPI data from customer service
  const customers = customerService.getCustomers();
  const totalCustomers = customers.length;
  const completedCustomers = customers.filter(c => c.status === "จบ").length;
  const curedPercentage = Math.round(customers.filter(c => c.resus === "CURED").length / totalCustomers * 100) || 0;
  const drPercentage = Math.round(customers.filter(c => c.resus === "DR").length / totalCustomers * 100) || 0;
  const totalPrinciple = customers.reduce((sum, customer) => sum + customer.principle, 0);

  // Random weather for demo
  useEffect(() => {
    const weatherOptions: Array<'sun' | 'cloud' | 'rain'> = ['sun', 'cloud', 'rain'];
    const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    setWeather(randomWeather);
  }, []);

  // Update time and simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate progress increase over time
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

  // Format the greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour < 12) return "สวัสดีตอนเช้า";
    if (hour < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  return (
    <div className="p-4">
      {/* Notification Panel (Marquee) */}
      <NotificationPanel />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tedtam-blue">{getGreeting()}</h1>
          <p className="text-gray-600">คุณ{userName}</p>
        </div>
      </div>

      {/* Weather Card */}
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

      {/* Progress Card */}
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

      {/* Task Tracker Section */}
      <div className="mb-4">
        <TaskTracker />
      </div>

      {/* Notepad Widget */}
      <div className="mb-4">
        <NotepadWidget />
      </div>

      {/* KPI Section */}
      <h2 className="text-lg font-semibold text-tedtam-blue mb-3">ตัวชี้วัดผลงาน (KPIs)</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="card-shadow border-l-4 border-l-tedtam-blue">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">จำนวนลูกค้า</p>
            <p className="text-xl font-bold">{totalCustomers} ราย</p>
            <p className="text-xs text-gray-400">จบแล้ว {completedCustomers} ราย</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-tedtam-orange">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">Principle</p>
            <p className="text-xl font-bold">{(totalPrinciple / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-400">เพิ่มขึ้น 5.2% จากวันก่อน</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">%CURED</p>
            <p className="text-xl font-bold">{curedPercentage}%</p>
            <p className="text-xs text-gray-400">เป้าหมาย 70%</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <p className="text-sm text-gray-500">%DR</p>
            <p className="text-xl font-bold">{drPercentage}%</p>
            <p className="text-xs text-gray-400">เป้าหมาย 20%</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistance Card */}
      <Card className="mb-4 bg-gradient-to-r from-tedtam-blue to-blue-500 text-white card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <div className="mr-3 bg-white/20 rounded-full p-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold">AI แนะนำ</h2>
          </div>
          <p className="text-sm mb-3">
            วันนี้มีลูกค้า 2 รายที่น่าจะต้องการการติดตามเป็นพิเศษ เนื่องจากใกล้ถึงกำหนดชำระ
          </p>
          <Button className="w-full bg-white text-tedtam-blue hover:bg-white/90">
            ดูรายละเอียด
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;