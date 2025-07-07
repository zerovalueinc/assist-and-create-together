import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 1. Lead volume over time (count of contacts by week)
router.get('/lead-volume', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase.rpc('lead_volume_by_week_warehouse', { user_id: userId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// 2. Success rate (deals won / total deals)
router.get('/success-rate', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('crm_deals')
    .select('data')
    .eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  const deals = (data || []).map((d: any) => d.data);
  const total = deals.length;
  const won = deals.filter((d: any) => (d.properties?.dealstage || '').toLowerCase().includes('won')).length;
  res.json({ total, won, successRate: total ? won / total : 0 });
});

// 3. Playbook → Outcome mapping (stub, to be implemented as needed)
router.get('/playbook-outcomes', authenticateToken, async (req, res) => {
  // TODO: Implement mapping from playbooks to outcomes using warehouse data
  res.json({ data: [] });
});

// 4. CRM-synced lead status funnel (deals by stage)
router.get('/lead-funnel', authenticateToken, async (req, res) => {
  const userId = req.user.id;
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
  res.json({ funnel });
});

export default router; 