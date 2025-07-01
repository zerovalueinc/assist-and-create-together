import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Zap, FolderOpen, BarChart3, User, LogOut, Home } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Workspace', icon: FolderOpen, path: '/workspace' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Account', icon: User, path: '/account' },
];

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/') }>
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">PersonaOps</h1>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              AI-Powered
            </Badge>
          </div>
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  aria-label={item.label}
                  onClick={() => navigate(item.path)}
                  className={`group flex items-center justify-center relative px-2 py-2 rounded-md transition-colors duration-150 focus:outline-none ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span
                    className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none z-20 transition-opacity duration-200"
                    role="tooltip"
                  >
                    {item.label}
                  </span>
                  <span
                    className={`ml-2 text-base font-medium transition-all duration-200 origin-left
                      ${'max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-focus:max-w-xs group-focus:opacity-100'}
                    `}
                    style={{
                      maxWidth: isActive ? '120px' : '0',
                      opacity: isActive ? 1 : undefined,
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email}
                    </p>
                    {user?.company && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.company}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
} 