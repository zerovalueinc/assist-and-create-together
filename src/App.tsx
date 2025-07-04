import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function withAuth(Component: React.ComponentType) {
  return function AuthGuard(props: any) {
    const session = useSession();
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!session) {
        navigate('/auth');
      }
    }, [session, navigate]);
    
    if (!session) {
      return null; // Don't render anything while redirecting
    }
    
    return <Component {...props} />;
  };
}

const AppRoutes = () => {
  const IndexWithAuth = withAuth(Index);
  const WorkspaceWithAuth = withAuth(Workspace);
  const AccountWithAuth = withAuth(Account);
  const AnalyticsWithAuth = withAuth(Analytics);
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Auth />} /> {/* Keep for backward compatibility */}
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<PasswordReset />} />
      <Route path="/" element={<IndexWithAuth />} />
      <Route path="/workspace" element={<WorkspaceWithAuth />} />
      <Route path="/account" element={<AccountWithAuth />} />
      <Route path="/analytics" element={<AnalyticsWithAuth />} />
    </Routes>
  );
};

function App() {
  return (
    <CompanyProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </CompanyProvider>
  );
}

export default App;
