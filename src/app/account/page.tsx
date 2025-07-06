'use client';
import * as React from "react";
import AccountHeader from '../../components/account/AccountHeader';
import BillingTab from '../../components/account/BillingTab';
import NotificationsTab from '../../components/account/NotificationsTab';
import PreferencesTab from '../../components/account/PreferencesTab';
import ProfileTab from '../../components/account/ProfileTab';
import SecurityTab from '../../components/account/SecurityTab';

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <AccountHeader />
      <ProfileTab />
      <BillingTab />
      <NotificationsTab />
      <PreferencesTab />
      <SecurityTab />
    </div>
  );
} 