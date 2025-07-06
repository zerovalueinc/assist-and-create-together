import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '@supabase/auth-helpers-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const GTMGenerator = () => {
  const [gtmPlaybooks, setGtmPlaybooks] = useState([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const user = useUser();

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('gtm_playbooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setGtmPlaybooks(data || []));
  }, [user?.id]);

  if (!user?.id) return null;

  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {gtmPlaybooks.map((row) => (
          <button
            key={row.id}
            className="rounded-full border px-4 py-1 text-sm bg-blue-100 hover:bg-blue-200"
            onClick={() => setSelectedPlaybook(row)}
          >
            {row.company_name || row.companyName || row.id}
          </button>
        ))}
      </div>
      <Dialog open={!!selectedPlaybook} onOpenChange={() => setSelectedPlaybook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Raw GTM Playbook Row</DialogTitle>
          </DialogHeader>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto max-h-[60vh]">
            {selectedPlaybook ? JSON.stringify(selectedPlaybook, null, 2) : ''}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GTMGenerator;
