import { createClient } from '@supabase/supabase-js';
// TODO: Adapt any agent/upload/status logic as needed

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, url, query, body, headers } = req;
  // TODO: Replace with real user auth
  const userId = headers['x-user-id'] || body?.user_id || query?.user_id;

  // POST /api/upload/instantly
  if (method === 'POST' && url.includes('/instantly')) {
    // TODO: Implement upload to Instantly logic
    return res.status(501).json({ error: 'Not implemented: upload to Instantly' });
  }

  // GET /api/upload/status/:icpId
  if (method === 'GET' && url.includes('/status/')) {
    // TODO: Implement upload status logic
    return res.status(501).json({ error: 'Not implemented: get upload status' });
  }

  res.status(404).json({ error: 'Not found' });
} 