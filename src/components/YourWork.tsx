import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export default function YourWork() {
  const { token } = useAuth();
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaybooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/icp/playbooks`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) setPlaybooks(data.playbooks);
        else setError('Failed to load your work.');
      } catch (err) {
        setError('Failed to load your work.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPlaybooks();
  }, [token]);

  return (
    <Card className="w-full mt-12 shadow-lg border-2 border-slate-100">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <FolderOpen className="h-6 w-6 text-blue-600" />
        <CardTitle className="text-xl font-bold">Your Work</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading your saved playbooks...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : playbooks.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No saved playbooks or reports yet.<br/>Generate something to see it here!</div>
        ) : (
          <div className="flex flex-col gap-4">
            {playbooks.map((pb) => (
              <div key={pb.id} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 rounded-lg border px-4 py-3 hover:shadow transition">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-lg text-slate-900">{pb.companyName || pb.companyUrl || 'Untitled'}</span>
                  <span className="text-xs text-slate-500">{pb.type || 'Company Analyzer'} &middot; {pb.createdAt ? new Date(pb.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button size="sm" variant="destructive" className="flex items-center gap-1">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 