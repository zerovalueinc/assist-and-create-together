import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Auth from "./components/Auth";
import EmailVerification from "./components/EmailVerification";
import PasswordReset from "./components/PasswordReset";
import ForgotPassword from "./components/ForgotPassword";
import { CompanyProvider } from "@/context/CompanyContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Workspace from '@/pages/Workspace';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/verify-email" element={<EmailVerification />} />
    <Route path="/reset-password" element={<PasswordReset />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route 
      path="/" 
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/account" 
      element={
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      } 
    />
    <Route path="/workspace" element={<Workspace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <CompanyProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CompanyProvider>
  </AuthProvider>
);

export default App;
