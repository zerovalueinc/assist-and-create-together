import { createClient } from '@supabase/supabase-js';
// TODO: Adapt any agent/research logic as needed

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, url, query, body, headers } = req;
  // TODO: Replace with real user auth
  const userId = headers['x-user-id'] || body?.user_id || query?.user_id;

  // POST /api/enrich/:leadId
  if (method === 'POST' && url.match(/\/api\/enrich\/([^\/]+)$/)) {
    // TODO: Implement enrichment logic using Supabase and new agent utilities
    return res.status(501).json({ error: 'Not implemented: enrich lead' });
  }

  // GET /api/enrich/:leadId
  if (method === 'GET' && url.match(/\/api\/enrich\/([^\/]+)$/)) {
    // TODO: Implement fetching enrichment for a lead
    return res.status(501).json({ error: 'Not implemented: get enrichment' });
  }

  res.status(404).json({ error: 'Not found' });
} 