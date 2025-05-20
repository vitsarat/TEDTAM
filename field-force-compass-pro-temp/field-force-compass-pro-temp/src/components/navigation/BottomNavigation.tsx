
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Users, 
  Map, 
  BarChart2, 
  Wallet 
} from "lucide-react";

const navItems = [
  { icon: Home, label: "หน้าหลัก", to: "/" },
  { icon: Users, label: "ลูกค้า", to: "/customers" },
  { icon: Map, label: "แผนที่", to: "/map" },
  { icon: BarChart2, label: "ผลงาน", to: "/performance" },
  { icon: Wallet, label: "กระเป๋าเงิน", to: "/wallet" },
];

export const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around max-w-md mx-auto shadow-md z-10">
      {navItems.map((item, index) => (
        <NavLink 
          key={index} 
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-16 h-full
            ${isActive 
              ? "text-tedtam-orange font-medium" 
              : "text-gray-500 hover:text-tedtam-blue"}
          `}
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};
