import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Zap, FolderOpen, BarChart3, User, LogOut } from 'lucide-react';
import YourWork from '@/components/YourWork';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/ui/AppHeader';

export default function Workspace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-10 shadow-md border-2 border-slate-100">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold">Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg text-slate-600 mb-2">
              Your Workspace is your hub for all saved playbooks, reports, and productivity tools. Access, manage, and take action on your work here.
            </CardDescription>
          </CardContent>
        </Card>
        <YourWork />
      </main>
    </div>
  );
} 