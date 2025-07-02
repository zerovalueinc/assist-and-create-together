import AppHeader from '@/components/ui/AppHeader';
import YourWork from '@/components/YourWork';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, Link, Key, Settings as SettingsIcon, Mail } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../hooks/useUserData';

const MOCK_TEAMMATES = [
  { name: 'Alice Johnson', email: 'alice@acme.com', role: 'Owner', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@acme.com', role: 'Member', status: 'Active' },
];

const MOCK_INTEGRATIONS = [
  { name: 'OpenRouter', connected: true },
  { name: 'Apollo', connected: false },
  { name: 'Instantly', connected: false },
];

const MOCK_API_KEYS = [
  { service: 'OpenRouter', key: 'sk-xxxx-xxxx', status: 'Valid' },
  { service: 'Apollo', key: '', status: 'Not Connected' },
  { service: 'Instantly', key: '', status: 'Not Connected' },
];

export default function Workspace() {
  const { user, isLoading } = useUser();
  const [inviteEmail, setInviteEmail] = useState('');
  const [apiKeys, setApiKeys] = useState(MOCK_API_KEYS);
  const [newKeys, setNewKeys] = useState({ OpenRouter: '', Apollo: '', Instantly: '' });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"><span>Loading user session...</span></div>;
  }
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"><span>Please log in to access your workspace.</span></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">Workspace</h1>
        <Tabs defaultValue="work" className="w-full">
          <TabsList className="w-full flex justify-center mb-8">
            <TabsTrigger value="work" className="flex items-center gap-2"><Mail className="h-4 w-4" />Your Work</TabsTrigger>
            <TabsTrigger value="teammates" className="flex items-center gap-2"><UserPlus className="h-4 w-4" />Teammates</TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2"><Link className="h-4 w-4" />Integrations</TabsTrigger>
            <TabsTrigger value="apikeys" className="flex items-center gap-2"><Key className="h-4 w-4" />API Keys</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2"><SettingsIcon className="h-4 w-4" />Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="work">
            <YourWork />
          </TabsContent>
          <TabsContent value="teammates">
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
                  {MOCK_TEAMMATES.map((tm, i) => (
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
          <TabsContent value="integrations">
            <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_INTEGRATIONS.map((intg, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
                      <div className="font-semibold text-lg text-slate-900">{intg.name}</div>
                      <div className="flex items-center gap-2">
                        {intg.connected ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800">Not Connected</Badge>
                        )}
                        <Button size="sm" variant="outline">{intg.connected ? 'Manage' : 'Connect'}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="apikeys">
            <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">API Keys <Badge variant="secondary">Per User</Badge></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((key, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg border px-4 py-3">
                      <div className="font-semibold text-lg text-slate-900">{key.service}</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          placeholder="Enter API Key"
                          value={newKeys[key.service] || ''}
                          onChange={e => setNewKeys({ ...newKeys, [key.service]: e.target.value })}
                          className="w-48"
                        />
                        <Button size="sm" variant="outline">Save</Button>
                        <Badge variant={key.status === 'Valid' ? 'secondary' : 'outline'} className={key.status === 'Valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{key.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card className="shadow-lg border-2 border-slate-100 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Workspace Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-slate-700">Workspace Name</label>
                    <Input placeholder="PersonaOps Workspace" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-slate-700">Brand Color</label>
                    <Input type="color" className="w-16 h-10 p-0 border-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-slate-700">Notifications</label>
                    <select className="border rounded p-2">
                      <option>Email Only</option>
                      <option>In-App Only</option>
                      <option>All</option>
                      <option>None</option>
                    </select>
                  </div>
                  <Button variant="default" className="mt-4">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 