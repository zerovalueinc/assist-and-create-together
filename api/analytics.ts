import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, url, headers } = req;
  const userId = headers['x-user-id'] || req.query?.user_id;
  if (method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  if (url.includes('/lead-volume')) {
    const { data, error } = await supabase.rpc('lead_volume_by_week_warehouse', { user_id: userId });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data });
  }
  if (url.includes('/success-rate')) {
    const { data, error } = await supabase
      .from('crm_deals')
      .select('data')
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    const deals = (data || []).map((d: any) => d.data);
    const total = deals.length;
    const won = deals.filter((d: any) => (d.properties?.dealstage || '').toLowerCase().includes('won')).length;
    return res.json({ total, won, successRate: total ? won / total : 0 });
  }
  if (url.includes('/playbook-outcomes')) {
    return res.json({ data: [] });
  }
  if (url.includes('/lead-funnel')) {
    const { data, error } = await supabase
      .from('crm_deals')
      .select('data')
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    const deals = (data || []).map((d: any) => d.data);
    const funnel = deals.reduce((acc: any, d: any) => {
      const stage = d.properties?.dealstage || 'Unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});
    return res.json({ funnel });
  }
  res.status(404).json({ error: 'Not found' });
} 