
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Target, Users, BarChart3, Mail, ArrowLeft, Crown, TrendingUp, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AccountHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const accountStats = [
    { 
      label: "Companies Analyzed", 
      value: "2,847", 
      icon: Target, 
      change: "+12%",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      label: "ICPs Generated", 
      value: "1,234", 
      icon: Users, 
      change: "+8%",
      color: "from-purple-500 to-pink-500"
    },
    { 
      label: "Leads Enriched", 
      value: "8,492", 
      icon: BarChart3, 
      change: "+23%",
      color: "from-green-500 to-emerald-500"
    },
    { 
      label: "Email Campaigns", 
      value: "156", 
      icon: Mail, 
      change: "+15%",
      color: "from-orange-500 to-red-500"
    },
  ];

  return (
    <>
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Account Settings
                  </h1>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 text-xs">
                    Enterprise Dashboard
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Account Overview */}
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 border-0 shadow-enterprise overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
          <CardContent className="pt-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 mb-8">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 text-2xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-2 shadow-lg">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email
                    }
                  </h2>
                  {user?.company && (
                    <p className="text-lg text-slate-600 mb-3">{user.company}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro Plan
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      <Award className="h-3 w-3 mr-1" />
                      Enterprise
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">847K</div>
                    <div className="text-sm text-slate-600">Revenue</div>
                    <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +47%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">34.2%</div>
                    <div className="text-sm text-slate-600">Conversion</div>
                    <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.7%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">1,247</div>
                    <div className="text-sm text-slate-600">Active Leads</div>
                    <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.3%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">$12.4K</div>
                    <div className="text-sm text-slate-600">Avg Deal</div>
                    <div className="flex items-center justify-center text-green-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.7%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {accountStats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
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
