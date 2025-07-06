// @ts-nocheck
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client (use env vars in production)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/invitations - create an invitation (user-centric)
router.post('/', authenticateToken, async (req, res) => {
  const { email } = req.body;
  const userId = req.user.id;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Insert invitation (user-centric)
  const { data, error } = await supabase
    .from('invitations')
    .insert({ email, inviter_user_id: userId })
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ invitation: data });
});

// GET /api/invitations - list invitations sent by the current user
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('inviter_user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ invitations: data });
});

export default router; 