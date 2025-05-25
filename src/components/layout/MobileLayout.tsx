
import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import HeaderMenu from "./HeaderMenu";
import UserMenu from "./UserMenu";

export const MobileLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderMenu />
      <UserMenu />
      
      <div className="flex-1 overflow-auto pb-16">
        <Outlet />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0">
        <BottomNavigation />
      </div>
    </div>
  );
};
