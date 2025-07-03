import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, headers } = req;
  const userId = headers['x-user-id'] || req.query?.user_id;
  if (method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role')
    .eq('id', userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ team: data });
} 