
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-9xl font-bold text-tedtam-blue">404</h1>
      <p className="text-xl font-medium mb-8">ไม่พบหน้านี้</p>
      <p className="text-gray-500 mb-10 max-w-md">
        หน้าที่คุณกำลังค้นหาอาจถูกลบไปแล้ว เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
      </p>
      <Button 
        onClick={() => navigate("/")} 
        className="flex items-center bg-tedtam-blue hover:bg-tedtam-blue/90"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        กลับไปหน้าหลัก
      </Button>
    </div>
  );
};

export default NotFound;
