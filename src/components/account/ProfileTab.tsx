import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Upload } from "lucide-react";
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '../../lib/supabase'; // See README for global pattern
import { useUserData } from '@/hooks/useUserData';

const ProfileTab = () => {
  const user = useUser();
  const session = useSession();
  const { email, firstName, lastName, company, initials } = useUserData();
  const { toast } = useToast();
  
  // Always show user info instantly
  const [profileData, setProfileData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: email,
    company: company,
    phone: '',
    jobTitle: '',
    timezone: 'UTC-8',
  });
  const [saving, setSaving] = useState(false);

  // Fetch canonical profile in background, merge if present
  useEffect(() => {
    let cancelled = false;
    const fetchProfileData = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled && !error && data) {
        setProfileData(prev => ({
          ...prev,
          firstName: data.first_name || prev.firstName,
          lastName: data.last_name || prev.lastName,
          email: data.email || prev.email,
          company: data.company || prev.company,
          phone: data.phone || prev.phone,
          jobTitle: data.job_title || prev.jobTitle,
          timezone: data.timezone || prev.timezone,
        }));
      }
    };
    fetchProfileData();
    return () => { cancelled = true; };
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          company: profileData.company,
          phone: profileData.phone,
          job_title: profileData.jobTitle,
          timezone: profileData.timezone,
        })
        .eq('id', user.id);
      if (error) throw error;
      // Also update Supabase user_metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
          company: profileData.company,
        }
      });
      if (authError) throw authError;
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      // Re-fetch profile after update
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (updatedProfile) {
        setProfileData(prev => ({
          ...prev,
          firstName: updatedProfile.first_name || prev.firstName,
          lastName: updatedProfile.last_name || prev.lastName,
          email: updatedProfile.email || prev.email,
          company: updatedProfile.company || prev.company,
          phone: updatedProfile.phone || prev.phone,
          jobTitle: updatedProfile.job_title || prev.jobTitle,
          timezone: updatedProfile.timezone || prev.timezone,
        }));
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Profile Update Failed",
        description: error.message || 'Could not update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
            </div>

            <Button onClick={handleProfileSave} className="w-full md:w-auto" disabled={saving} aria-busy={saving} aria-label="Save profile changes">
              {saving ? 'Saving...' : (<><Check className="h-4 w-4 mr-2" />Save Changes</>)}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col h-full">
        <Card className="min-w-[260px]">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a professional photo for your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full flex items-center gap-2" disabled>
                <Upload className="h-4 w-4" />
                Upload Photo (coming soon)
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 min-w-[260px] flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last login</span>
                <span className="text-sm font-medium">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Account created</span>
                <span className="text-sm font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Plan expires</span>
                <span className="text-sm font-medium">Dec 31, 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileTab;
