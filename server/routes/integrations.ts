import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { ingestHubspotData } from '../utils/hubspotIngest';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID!;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET!;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI!;
const HUBSPOT_SCOPES = 'contacts'; // Add more scopes as needed

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

// 1. Get HubSpot integration status for current user in workspace
router.get('/hubspot/status', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Find integration for this user in this workspace
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('provider', 'hubspot')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: integration?.status || 'not_connected', integration });
});

// 2. Get HubSpot OAuth URL
router.get('/hubspot/auth-url', authenticateToken, async (req, res) => {
  // Pass workspace_id and user_id as state for callback
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  const state = `${workspaceId}:${userId}`;
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${encodeURIComponent(HUBSPOT_SCOPES)}&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}&state=${encodeURIComponent(state)}`;
  res.json({ url });
});

// 3. Handle HubSpot OAuth callback
router.get('/hubspot/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).json({ error: 'Missing code or state' });
  try {
    // Parse state for workspace_id and user_id
    const [workspace_id, user_id] = String(state).split(':');
    if (!workspace_id || !user_id) return res.status(400).json({ error: 'Invalid state' });
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
    // Upsert integration for this user in this workspace
    const { error } = await supabase
      .from('integrations')
      .upsert([
        {
          workspace_id,
          user_id,
          provider: 'hubspot',
          access_token,
          refresh_token,
          status: 'connected',
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'workspace_id,user_id,provider' });
    if (error) return res.status(500).json({ error: error.message });
    // Trigger ingestion job
    try {
      await ingestHubspotData({ workspace_id, user_id, access_token });
    } catch (ingestErr) {
      console.error('HubSpot ingestion error:', ingestErr);
      // Do not block user, just log
    }
    res.redirect('/workspace?integration=hubspot&status=connected');
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to exchange code' });
  }
});

// 4. Disconnect HubSpot for current user in workspace
router.post('/hubspot/disconnect', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Delete integration for this user in this workspace
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('provider', 'hubspot');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// GET /hubspot/status/all - get CRM status for all teammates in workspace
router.get('/hubspot/status/all', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = await getWorkspaceId(userId);
  if (!workspaceId) return res.status(400).json({ error: 'Workspace not found' });
  // Get all teammates
  const { data: teammates, error: teamError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .eq('workspace_id', workspaceId);
  if (teamError) return res.status(500).json({ error: teamError.message });
  // Get all integrations for workspace
  const { data: integrations, error: intError } = await supabase
    .from('integrations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('provider', 'hubspot');
  if (intError) return res.status(500).json({ error: intError.message });
  // Map status for each teammate
  const statusList = (teammates || []).map(tm => {
    const integration = (integrations || []).find(intg => intg.user_id === tm.id);
    return {
      user_id: tm.id,
      name: `${tm.first_name || ''} ${tm.last_name || ''}`.trim() || tm.email,
      email: tm.email,
      status: integration?.status || 'not_connected',
      integration
    };
  });
  res.json({ statuses: statusList });
});

export default router; 