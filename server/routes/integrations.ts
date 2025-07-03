import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID!;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET!;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI!;
const HUBSPOT_SCOPES = 'contacts'; // Add more scopes as needed

// 1. Get HubSpot integration status for current workspace
router.get('/hubspot/status', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  // Find workspace for this user
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (wsError || !ws?.id) return res.status(400).json({ error: 'Workspace not found' });
  // Find integration
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('workspace_id', ws.id)
    .eq('provider', 'hubspot')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: integration?.status || 'not_connected', integration });
});

// 2. Get HubSpot OAuth URL
router.get('/hubspot/auth-url', authenticateToken, async (req, res) => {
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${encodeURIComponent(HUBSPOT_SCOPES)}&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}`;
  res.json({ url });
});

// 3. Handle HubSpot OAuth callback
router.get('/hubspot/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    // Exchange code for tokens
    const tokenRes = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        code
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token, refresh_token, expires_in } = tokenRes.data;
    // You must determine workspace_id from state or session (for demo, assume state=workspace_id)
    const workspace_id = state;
    if (!workspace_id) return res.status(400).json({ error: 'Missing workspace_id' });
    // Upsert integration
    const { error } = await supabase
      .from('integrations')
      .upsert([
        {
          workspace_id,
          provider: 'hubspot',
          access_token,
          refresh_token,
          status: 'connected',
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'workspace_id,provider' });
    if (error) return res.status(500).json({ error: error.message });
    // Optionally trigger ingestion job here
    res.redirect('/workspace?integration=hubspot&status=connected');
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to exchange code' });
  }
});

// 4. Disconnect HubSpot
router.post('/hubspot/disconnect', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  // Find workspace for this user
  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (wsError || !ws?.id) return res.status(400).json({ error: 'Workspace not found' });
  // Delete integration
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('workspace_id', ws.id)
    .eq('provider', 'hubspot');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router; 