import express from 'express';
import fetch from 'node-fetch';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/company-analyze (proxy to Supabase Edge Function)
router.post('/', authenticateToken, async (req, res) => {
  const SUPABASE_EDGE_URL = process.env.SUPABASE_EDGE_URL || 'https://hbogcsztrryrepudceww.functions.supabase.co/company-analyze';
  const userToken = req.headers['authorization'] || req.user?.access_token;
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
});

// GET /api/company-analyze/reports - List all saved company analysis reports for the user
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Backfill company_analysis_reports from cache for this user
    const { getRows } = require('../database/init');
    const cacheEntries = await getRows('SELECT url, comprehensiveData, createdAt FROM cache WHERE userId = ? AND comprehensiveData IS NOT NULL', [userId]);
    for (const entry of cacheEntries) {
      let companyName = null;
      try {
        const data = typeof entry.comprehensiveData === 'string' ? JSON.parse(entry.comprehensiveData) : entry.comprehensiveData;
        companyName = data.companyName || data.company_name || entry.url;
      } catch (e) {
        companyName = entry.url;
      }
      await require('../database/init').saveReport(userId, companyName, entry.url, null);
    }
    // Now return all saved reports
    const reports = await require('../database/init').getSavedReports(userId);
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching saved company analysis reports:', error);
    res.status(500).json({ error: 'Failed to fetch saved reports' });
  }
});

export default router; 