import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== Vercel API Route Debug ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Auth header present:', !!req.headers['authorization']);
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const SUPABASE_EDGE_URL = 'https://hbogcsztrryrepudceww.functions.supabase.co/company-analyze';
  const userToken = req.headers['authorization'];
  try {
    console.log('Calling Supabase edge function...');
    const edgeRes = await fetch(SUPABASE_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userToken ? { 'Authorization': userToken } : {}),
      },
      body: JSON.stringify(req.body),
    });
    const text = await edgeRes.text();
    console.log('Edge function response status:', edgeRes.status);
    console.log('Edge function response text:', text);
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    res.status(edgeRes.status).json(data);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Proxy to Supabase Edge Function failed', details: errMsg });
  }
} 