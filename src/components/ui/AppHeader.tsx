import * as React from "react";
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Zap, FolderOpen, BarChart3, User, LogOut, Home, Shield, Briefcase, Key, Mail, Lock, Layers, List, Settings, FileText, CheckCircle, Activity } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Intel', icon: Shield, path: '/intel' },
  { label: 'GTM', icon: Briefcase, path: '/gtm' },
  { label: 'Sales Intelligence', icon: BarChart3, path: '/sales-intelligence' },
  { label: 'Lead Enrichment', icon: Layers, path: '/lead-enrichment' },
  { label: 'Your Work', icon: List, path: '/your-work' },
  { label: 'System Audit', icon: Activity, path: '/system-audit' },
  { label: 'Pipeline Orchestrator', icon: Settings, path: '/pipeline-orchestrator' },
  { label: 'Email Campaigns', icon: Mail, path: '/email-campaigns' },
  { label: 'CRM Table', icon: FileText, path: '/crm-table' },
  { label: 'API Key Setup', icon: Key, path: '/api-key-setup' },
  { label: 'Account', icon: User, path: '/account' },
];

export default function AppHeader() {
  const user = useUser();
  const { user: userData, loading } = useUserData() as { user: any, loading: boolean };
  const fullName = userData?.full_name || userData?.fullName || '';
  const company = userData?.company || '';
  const initials = userData?.initials || '';

  const handleLogout = async () => {
    const { supabase } = await import('@/lib/supabaseClient');
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">PersonaOps</h1>
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              AI-Powered
            </Badge>
          </div>
          <nav className="flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="flex items-center justify-center p-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-2 font-medium transition-all duration-300">
                  {item.label}
                </span>
              </Link>
            ))}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-4">
                    <Avatar className="h-8 w-8">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="avatar" className="h-8 w-8 rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border shadow-lg" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-slate-900">{fullName || user.email}</p>
                      {company && (
                        <p className="w-[200px] truncate text-sm text-slate-600">
                          {company}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => window.location.href = '/account'} className="cursor-pointer hover:bg-slate-50">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-slate-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="ml-4" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
