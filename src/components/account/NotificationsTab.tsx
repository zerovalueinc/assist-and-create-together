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
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/auth/notifications', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationSettings({
            emailNotifications: data.notifications.email,
            smsNotifications: data.notifications.sms,
            campaignAlerts: true,
            weeklyReports: true,
            securityAlerts: true,
          });
        }
      } catch {}
    };
    fetchNotifications();
  }, [token]);

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

        <Button className="w-full md:w-auto" onClick={async () => {
          setLoading(true);
          try {
            const response = await fetch('/api/auth/notifications', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                email: notificationSettings.emailNotifications,
                sms: notificationSettings.smsNotifications,
                campaignAlerts: notificationSettings.campaignAlerts,
                weeklyReports: notificationSettings.weeklyReports,
                securityAlerts: notificationSettings.securityAlerts,
              }),
            });
            if (response.ok) {
              toast({ title: 'Notification Settings Saved', description: 'Your notification preferences have been updated.' });
            } else {
              toast({ title: 'Failed to Save', description: 'Could not update notification settings.', variant: 'destructive' });
            }
          } catch {
            toast({ title: 'Network Error', description: 'Could not update notification settings.', variant: 'destructive' });
          } finally {
            setLoading(false);
          }
        }} disabled={loading} aria-busy={loading} aria-label="Save notification settings">
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
