import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Helper: get workspace_id for current user
async function getWorkspaceId(userId: string) {
  const { data: ws, error } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (error || !ws?.id) return null;
  return ws.id;
}

// 1. Lead volume over time
router.get('/lead-volume', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Example: count leads per week
  const { data, error } = await supabase.rpc('lead_volume_by_week', { workspace_id: workspaceId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// 2. Success rate (connected → deal stage %)
router.get('/success-rate', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Example: calculate success rate from leads table
  const { data, error } = await supabase.rpc('lead_success_rate', { workspace_id: workspaceId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// 3. Playbook → Outcome mapping
router.get('/playbook-outcomes', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Example: join playbooks and outcomes
  const { data, error } = await supabase.rpc('playbook_outcomes', { workspace_id: workspaceId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// 4. CRM-synced lead status funnel
router.get('/lead-funnel', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Example: count leads by status
  const { data, error } = await supabase.rpc('lead_funnel_by_status', { workspace_id: workspaceId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

export default router; 