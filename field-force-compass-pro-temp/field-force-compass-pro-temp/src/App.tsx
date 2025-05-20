
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/CustomerList";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerForm from "./pages/CustomerForm";
import MapView from "./pages/MapView";
import Performance from "./pages/Performance";
import WalletPage from "./pages/Wallet";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Auth-aware layout component
const AuthenticatedLayout = () => {
  return (
    <ProtectedRoute>
      <MobileLayout />
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<AuthenticatedLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customer/:id" element={<CustomerProfile />} />
                <Route path="/customer/add" element={<CustomerForm />} />
                <Route path="/customer/edit/:id" element={<CustomerForm />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
