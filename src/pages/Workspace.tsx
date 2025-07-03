import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Link, BarChart3, Mail, Plus, UserPlus, Key, Settings as SettingsIcon, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/ui/AppHeader';

const MOCK_TEAM = [
  { name: 'Alice Johnson', email: 'alice@acme.com', role: 'Owner', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@acme.com', role: 'Member', status: 'Active' },
];

const MOCK_CRMS = [
  { name: 'HubSpot', connected: true },
  { name: 'Salesforce', connected: false },
  { name: 'Pipedrive', connected: false },
];

const MOCK_STATS = [
  { label: "Leads Sent to CRM", value: "1,234", icon: Mail, change: "+15%" },
  { label: "Team Members", value: "8", icon: Users, change: "+2" },
  { label: "Connected CRMs", value: "1", icon: Link, change: "" },
  { label: "Enriched Leads", value: "3,210", icon: BarChart3, change: "+8%" },
];

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('team');
  const [inviteEmail, setInviteEmail] = useState('');
  const [team, setTeam] = useState(MOCK_TEAM);
  const [crms, setCrms] = useState(MOCK_CRMS);
  const [workspaceName, setWorkspaceName] = useState('PersonaOps Workspace');
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [notifications, setNotifications] = useState('All');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">Workspace Reports <Badge variant="secondary">Central</Badge></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Mock ICP Reports */}
              {[{id:1, companyName:'Bold Commerce', companyUrl:'boldcommerce.com'}, {id:2, companyName:'Txtcart', companyUrl:'txtcart.com'}].map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-white border rounded px-2 py-1">
                  <img src={`https://www.google.com/s2/favicons?domain=${item.companyUrl}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
                  <span className="font-medium text-sm">{item.companyName}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Download"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></Button>
                </div>
              ))}
              {/* Mock GTM Playbooks */}
              {[{id:3, companyName:'Acme Playbook', companyUrl:'acme.com'}].map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-white border rounded px-2 py-1">
                  <img src={`https://www.google.com/s2/favicons?domain=${item.companyUrl}`} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
                  <span className="font-medium text-sm">{item.companyName}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Download"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border border-slate-200">
          <CardContent className="pt-6">
            {/* Workspace Name and Stats */}
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{workspaceName}</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Workspace
                  </Badge>
                  <Badge variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {MOCK_STATS.map((stat, index) => (
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
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="team" className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Team</span>
                </TabsTrigger>
                <TabsTrigger value="crm" className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>CRM Integrations</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Lead Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>
              {/* Team Tab */}
              <TabsContent value="team">
                <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">Team Members <Badge variant="secondary">Enterprise</Badge></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 flex gap-2">
                      <Input
                        placeholder="Invite teammate by email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                      />
                      <Button variant="default" className="flex items-center gap-1"><Plus className="h-4 w-4" />Invite</Button>
                    </div>
                    <div className="space-y-3">
                      {team.map((tm, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
                          <div>
                            <span className="font-semibold text-lg text-slate-900">{tm.name}</span>
                            <span className="block text-xs text-slate-500">{tm.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{tm.role}</Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">{tm.status}</Badge>
                            <Button size="sm" variant="destructive">Remove</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* CRM Integrations Tab */}
              <TabsContent value="crm">
                <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">CRM Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {crms.map((crm, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
                          <div className="font-semibold text-lg text-slate-900">{crm.name}</div>
                          <div className="flex items-center gap-2">
                            {crm.connected ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800">Not Connected</Badge>
                            )}
                            <Button size="sm" variant="outline">{crm.connected ? 'Manage' : 'Connect'}</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Lead Analytics Tab */}
              <TabsContent value="leads">
                <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">Lead Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-slate-500 py-8">
                      <p>Lead analytics and CRM reporting will appear here.</p>
                      <p className="mt-2 text-xs">(e.g., speed to close, lead quality, CRM sync status, etc.)</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">Workspace Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-slate-700">Workspace Name</label>
                        <Input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-slate-700">Brand Color</label>
                        <Input type="color" className="w-16 h-10 p-0 border-none" value={brandColor} onChange={e => setBrandColor(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-slate-700">Notifications</label>
                        <select className="border rounded p-2" value={notifications} onChange={e => setNotifications(e.target.value)}>
                          <option>All</option>
                          <option>Email Only</option>
                          <option>In-App Only</option>
                          <option>None</option>
                        </select>
                      </div>
                      <Button variant="default" className="mt-4">Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 