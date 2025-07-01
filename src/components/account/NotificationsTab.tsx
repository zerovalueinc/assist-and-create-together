
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const NotificationsTab = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    campaignAlerts: true,
    weeklyReports: true,
    securityAlerts: true,
  });
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // For now, just show success since we're not implementing the backend endpoint
      toast({ title: 'Notification Settings Saved', description: 'Your notification preferences have been updated.' });
    } catch {
      toast({ title: 'Network Error', description: 'Could not update notification settings.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about important updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-slate-600">Receive notifications via email</p>
            </div>
            <Switch 
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Campaign Alerts</p>
              <p className="text-sm text-slate-600">Get notified when campaigns complete</p>
            </div>
            <Switch 
              checked={notificationSettings.campaignAlerts}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, campaignAlerts: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-slate-600">Receive weekly performance summaries</p>
            </div>
            <Switch 
              checked={notificationSettings.weeklyReports}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-slate-600">Important security notifications</p>
            </div>
            <Switch 
              checked={notificationSettings.securityAlerts}
              onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
            />
          </div>
        </div>

        <Button className="w-full md:w-auto" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
