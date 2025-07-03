import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '../../lib/supabase'; // See README for global pattern

const ProfileTab = () => {
  const { user, profile } = useAuth();
  const { email, firstName, lastName, company, initials } = useUserData();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: email,
    company: company,
    phone: '',
    jobTitle: '',
    timezone: 'UTC-8',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (!user) return;
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          setProfileData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            company: data.company || '',
            phone: data.phone || '',
            jobTitle: data.job_title || '',
            timezone: data.timezone || 'UTC-8',
          });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchProfileData();
    return () => { cancelled = true; };
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    setLoading(true);
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
        setProfileData({
          firstName: updatedProfile.first_name || '',
          lastName: updatedProfile.last_name || '',
          email: updatedProfile.email || '',
          company: updatedProfile.company || '',
          phone: updatedProfile.phone || '',
          jobTitle: updatedProfile.job_title || '',
          timezone: updatedProfile.timezone || 'UTC-8',
        });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Profile Update Failed",
        description: error.message || 'Could not update profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

            <Button onClick={handleProfileSave} className="w-full md:w-auto" disabled={loading} aria-busy={loading} aria-label="Save profile changes">
              {loading ? 'Saving...' : (<><Check className="h-4 w-4 mr-2" />Save Changes</>)}
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
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-slate-500 text-center">
                JPG, PNG or GIF. Max size 5MB.
              </p>
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
