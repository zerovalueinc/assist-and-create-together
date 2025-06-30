
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PreferencesTab = () => {
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState({
    timezone: 'UTC-8',
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>General Preferences</CardTitle>
          <CardDescription>
            Customize your experience and interface settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={profileData.timezone}
              onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-slate-600">Toggle dark theme</p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Auto-save Drafts</p>
              <p className="text-sm text-slate-600">Automatically save work in progress</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Control how your data is used and stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Analytics Tracking</p>
              <p className="text-sm text-slate-600">Help improve our service</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Data Export</p>
              <p className="text-sm text-slate-600">Download all your data</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesTab;
