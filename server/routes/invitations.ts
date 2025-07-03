import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client (use env vars in production)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/invitations - create an invitation
router.post('/', authenticateToken, async (req, res) => {
  const { email } = req.body;
  const userId = req.user.id;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Find workspace for this user
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (wsError || !ws?.id) return res.status(400).json({ error: 'Workspace not found' });

  // Insert invitation
  const { data, error } = await supabase
    .from('invitations')
    .insert({ email, workspace_id: ws.id })
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ invitation: data });
});

// GET /api/invitations?workspace_id=... - list invitations for a workspace
router.get('/', authenticateToken, async (req, res) => {
  const { workspace_id } = req.query;
  if (!workspace_id) return res.status(400).json({ error: 'workspace_id required' });
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('workspace_id', workspace_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ invitations: data });
});

export default router; 