import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, CreditCard, Shield, Bell } from "lucide-react";
import AccountHeader from "@/components/account/AccountHeader";
import ProfileTab from "@/components/account/ProfileTab";
import SecurityTab from "@/components/account/SecurityTab";
import BillingTab from "@/components/account/BillingTab";
import NotificationsTab from "@/components/account/NotificationsTab";
import PreferencesTab from "@/components/account/PreferencesTab";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/ui/AppHeader';

const Account = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('yourwork');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [work, setWork] = useState([]);

  useEffect(() => {
    const fetchWork = async () => {
      setLoading(true);
      setError('');
      try {
        const [analyzeRes, icpRes, playbookRes] = await Promise.all([
          fetch('/api/company-analyze/reports', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/icp/reports', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/icp/playbooks', { headers: { 'Authorization': `Bearer ${token}` } }),
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
        setLoading(false);
      }
    };
    fetchWork();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <AccountHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards (if any) */}
        {/* Main Tabs */}
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
      </div>
    </div>
  );
};

export default Account;
