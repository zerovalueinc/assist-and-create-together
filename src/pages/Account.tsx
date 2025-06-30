
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, CreditCard, Shield, Bell } from "lucide-react";
import AccountHeader from "@/components/account/AccountHeader";
import ProfileTab from "@/components/account/ProfileTab";
import SecurityTab from "@/components/account/SecurityTab";
import BillingTab from "@/components/account/BillingTab";
import NotificationsTab from "@/components/account/NotificationsTab";
import PreferencesTab from "@/components/account/PreferencesTab";

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AccountHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
