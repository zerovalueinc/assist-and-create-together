// @ts-nocheck
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET /api/team - list the current user profile only (no workspace logic)
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role')
    .eq('id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ team: data });
});

export default router; 