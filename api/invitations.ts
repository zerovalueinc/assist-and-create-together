import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, body, headers } = req;
  const userId = headers['x-user-id'] || body?.user_id;

  if (method === 'POST') {
    const { email } = body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const { data, error } = await supabase
      .from('invitations')
      .insert({ email, inviter_user_id: userId })
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ invitation: data });
  }
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('inviter_user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ invitations: data });
  }
  res.status(405).json({ error: 'Method Not Allowed' });
} 