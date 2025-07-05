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

// 1. Get HubSpot integration status for current user
router.get('/hubspot/status', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'hubspot')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: integration?.status || 'not_connected', integration });
});

// 2. Get HubSpot OAuth URL
router.get('/hubspot/auth-url', authenticateToken, async (req, res) => {
  // Pass user_id as state for callback
  const userId = req.user.id;
  const state = `${userId}`;
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${encodeURIComponent(HUBSPOT_SCOPES)}&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}&state=${encodeURIComponent(state)}`;
  res.json({ url });
});

// 3. Handle HubSpot OAuth callback
router.get('/hubspot/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).json({ error: 'Missing code or state' });
  try {
    // Parse state for user_id
    const user_id = String(state);
    if (!user_id) return res.status(400).json({ error: 'Invalid state' });
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
    // Upsert integration for this user
    const { error } = await supabase
      .from('integrations')
      .upsert([
        {
          user_id,
          provider: 'hubspot',
          access_token,
          refresh_token,
          status: 'connected',
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'user_id,provider' });
    if (error) return res.status(500).json({ error: error.message });
    // Trigger ingestion job
    try {
      await ingestHubspotData({ user_id, access_token });
    } catch (ingestErr) {
      console.error('HubSpot ingestion error:', ingestErr);
      // Do not block user, just log
    }
    res.redirect('/workspace?integration=hubspot&status=connected');
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to exchange code' });
  }
});

// 4. Disconnect HubSpot for current user
router.post('/hubspot/disconnect', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('user_id', userId)
    .eq('provider', 'hubspot');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// GET /hubspot/status/all - get CRM status for just the current user
router.get('/hubspot/status/all', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  // Get integration for user
  const { data: integration, error: intError } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'hubspot')
    .maybeSingle();
  if (intError) return res.status(500).json({ error: intError.message });
  // Map status for the user
  const statusList = [{
    user_id: userId,
    name: '',
    email: '',
    status: integration?.status || 'not_connected',
    integration
  }];
  res.json({ statuses: statusList });
});

export default router; 