import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { ingestHubspotData } from '../server/utils/hubspotIngest';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID!;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET!;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI!;
const HUBSPOT_SCOPES = 'contacts';

export default async function handler(req, res) {
  const { method, url, query, body, headers } = req;
  const userToken = headers['authorization'] || '';
  // Simulate user auth (replace with your own auth logic as needed)
  const userId = req.headers['x-user-id'] || req.body?.user_id || req.query?.user_id;

  if (method === 'GET' && url.includes('/hubspot/status')) {
    // /api/integrations/hubspot/status
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'hubspot')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ status: integration?.status || 'not_connected', integration });
  }
  if (method === 'GET' && url.includes('/hubspot/auth-url')) {
    // /api/integrations/hubspot/auth-url
    const state = `${userId}`;
    const url = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${encodeURIComponent(HUBSPOT_SCOPES)}&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}&state=${encodeURIComponent(state)}`;
    return res.json({ url });
  }
  if (method === 'GET' && url.includes('/hubspot/callback')) {
    // /api/integrations/hubspot/callback
    const { code, state } = query;
    if (!code || !state) return res.status(400).json({ error: 'Missing code or state' });
    try {
      const user_id = String(state);
      if (!user_id) return res.status(400).json({ error: 'Invalid state' });
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
      const { access_token, refresh_token } = tokenRes.data;
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
      try {
        await ingestHubspotData({ user_id, access_token });
      } catch (ingestErr) {
        // Log but do not block
      }
      return res.redirect('/workspace?integration=hubspot&status=connected');
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to exchange code' });
    }
  }
  if (method === 'POST' && url.includes('/hubspot/disconnect')) {
    // /api/integrations/hubspot/disconnect
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'hubspot');
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
  if (method === 'GET' && url.includes('/hubspot/status/all')) {
    // /api/integrations/hubspot/status/all
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', userId)
      .maybeSingle();
    if (profileError) return res.status(500).json({ error: profileError.message });
    const { data: integration, error: intError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'hubspot')
      .maybeSingle();
    if (intError) return res.status(500).json({ error: intError.message });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const statusList = [{
      user_id: profile.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
      email: profile.email,
      status: integration?.status || 'not_connected',
      integration
    }];
    return res.json({ statuses: statusList });
  }
  res.status(404).json({ error: 'Not found' });
} 