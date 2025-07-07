import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, CreditCard, Shield, Bell, Target, Users, BarChart3, Mail } from "lucide-react";
import ProfileTab from "@/components/account/ProfileTab";
import SecurityTab from "@/components/account/SecurityTab";
import BillingTab from "@/components/account/BillingTab";
import NotificationsTab from "@/components/account/NotificationsTab";
import PreferencesTab from "@/components/account/PreferencesTab";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/ui/AppHeader';
import { useUserData } from '@/hooks/useUserData';

const Account = () => {
  const user = useUser();
  const session = useSession();
  const { fullName, company, initials } = useUserData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loadingWork, setLoadingWork] = useState(false);
  const [error, setError] = useState('');
  const [work, setWork] = useState([]);

  if (!user || !session) {
    window.location.href = '/auth';
    return null;
  }

  const accountStats = [
    { label: "Companies Analyzed", value: "2,847", icon: Target, change: "+12%" },
    { label: "ICPs Generated", value: "1,234", icon: Users, change: "+8%" },
    { label: "Leads Enriched", value: "8,492", icon: BarChart3, change: "+23%" },
    { label: "Email Campaigns", value: "156", icon: Mail, change: "+15%" },
  ];

  useEffect(() => {
    const fetchWork = async () => {
      setLoadingWork(true);
      setError('');
      try {
        const [analyzeRes, icpRes, playbookRes] = await Promise.all([
          fetch('/api/company-analyze/reports', { 
            headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {} 
          }),
          fetch('/api/app/icp/reports', { 
            headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {} 
          }),
          fetch('/api/app/icp/playbooks', { 
            headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {} 
          }),
        ]);
        if (!analyzeRes.ok && !icpRes.ok && !playbookRes.ok) throw new Error('Failed to fetch work');
        const analyze = analyzeRes.ok ? (await analyzeRes.json()).reports || [] : [];
        const icps = icpRes.ok ? (await icpRes.json()).icps || [] : [];
        const playbooks = playbookRes.ok ? (await playbookRes.json()).playbooks || [] : [];
        setWork([
          ...analyze.map(r => ({ ...r, type: 'Company Analyzer' })),
          ...icps.map(r => ({ ...r, type: 'ICP' })),
          ...playbooks.map(r => ({ ...r, type: 'Playbook' })),
        ]);
      } catch (e) {
        setError('Could not load your work.');
      } finally {
        setLoadingWork(false);
      }
    };
    fetchWork();
  }, [session?.access_token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border border-slate-200">
          <CardContent className="pt-6">
            {/* Profile and Stats */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                {company && (
                  <p className="text-slate-600">{company}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Pro Plan
                  </Badge>
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {accountStats.map((stat, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
            {/* Tabs - now directly under stats, on white */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Preferences</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>
              <TabsContent value="billing">
                <BillingTab />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsTab />
              </TabsContent>
              <TabsContent value="preferences">
                <PreferencesTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
