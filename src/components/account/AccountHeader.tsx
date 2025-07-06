import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, Users, BarChart3, Mail } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const AccountHeader = () => {
  const { user } = useUserData() as { user: any, loading: boolean };
  const fullName = user?.user_metadata?.fullName || user?.user_metadata?.name || user?.email || '';
  const company = user?.user_metadata?.company || '';
  const initials = fullName ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '';

  const accountStats = [
    { label: "Companies Analyzed", value: "2,847", icon: Target, change: "+12%" },
    { label: "ICPs Generated", value: "1,234", icon: Users, change: "+8%" },
    { label: "Leads Enriched", value: "8,492", icon: BarChart3, change: "+23%" },
    { label: "Email Campaigns", value: "156", icon: Mail, change: "+15%" },
  ];

  return (
    <>
      {/* Account Overview */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AccountHeader;
