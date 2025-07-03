export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const SUPABASE_EDGE_URL = 'https://hbogcsztrryrepudceww.functions.supabase.co/company-analyze';
  const userToken = req.headers['authorization'];
  try {
    const edgeRes = await fetch(SUPABASE_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userToken ? { 'Authorization': userToken } : {}),
      },
      body: JSON.stringify(req.body),
    });
    const text = await edgeRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    res.status(edgeRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy to Supabase Edge Function failed', details: err.message });
  }
} 