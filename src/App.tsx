import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CompanyProvider } from '@/context/CompanyContext';
import { Toaster } from "@/components/ui/toaster";
import Auth from '@/components/Auth';
import EmailVerification from '@/components/EmailVerification';
import ForgotPassword from '@/components/ForgotPassword';
import PasswordReset from '@/components/PasswordReset';
import Index from '@/pages/Index';
import Workspace from '@/pages/Workspace';
import Account from '@/pages/Account';
import Analytics from '@/pages/Analytics';
import { Loader2 } from 'lucide-react';
import { DataPreloadProvider } from '@/context/DataPreloadProvider';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      <Route path="/verify-email" element={
        <PublicRoute>
          <EmailVerification />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <PasswordReset />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/workspace" element={
        <ProtectedRoute>
          <Workspace />
        </ProtectedRoute>    
      } />
      <Route path="/account" element={
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <CompanyProvider>
      <AuthProvider>
        <DataPreloadProvider>
          <Router>
            <AppRoutes />
            <Toaster />
          </Router>
        </DataPreloadProvider>
      </AuthProvider>
    </CompanyProvider>
  );
}

export default App;
