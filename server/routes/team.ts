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

// GET /api/team - list all teammates for the current workspace
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, workspace_id')
    .eq('workspace_id', workspaceId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ team: data });
});

export default router; 