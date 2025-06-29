import express from 'express';
import { generateComprehensiveIBP } from '../../agents/claude';
import { getCachedResult, saveToCache, createSalesIntelligenceReport, getSalesIntelligenceReport } from '../database/init';

const router = express.Router();

// POST /api/company-analyze
router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Company URL is required.' });
  }

  let sanitizedUrl = url;
  if (!/^https?:\/\//i.test(sanitizedUrl)) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }

  // Timeout logic (enterprise-grade reliability)
  const timeoutMs = 60000; // 60 seconds
  let timeoutHandle: NodeJS.Timeout | undefined = undefined;
  let finished = false;

  try {
    // 1. Check cache first
    const cached = await getCachedResult(sanitizedUrl, true);
    if (cached && cached.comprehensiveData && !cached.isExpired) {
      // Optionally, get the full report for downstream clarity
      const report = await getSalesIntelligenceReport(sanitizedUrl);
      finished = true;
      return res.json({ success: true, analysis: cached.comprehensiveData, isCached: true, report });
    }

    // 2. If not cached, run LLM with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        if (!finished) {
          finished = true;
          reject(new Error('Analysis timed out. Please try again later.'));
        }
      }, timeoutMs);
    });

    const analysisPromise = (async (): Promise<{ analysis: any, report: any }> => {
      const analysis = await generateComprehensiveIBP(sanitizedUrl);
      // Save to reporting tables for downstream clarity
      const reportId = await createSalesIntelligenceReport(
        analysis.companyOverview?.companyName || sanitizedUrl,
        sanitizedUrl,
        analysis
      );
      // Save to cache for cost savings
      await saveToCache(sanitizedUrl, true, analysis, analysis, reportId);
      // Get the full report for downstream use
      const report = await getSalesIntelligenceReport(sanitizedUrl);
      return { analysis, report };
    })();

    const { analysis, report } = await Promise.race([analysisPromise, timeoutPromise]) as { analysis: any, report: any };
    finished = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    return res.json({ success: true, analysis, isCached: false, report });
  } catch (error: any) {
    finished = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    console.error('Company analysis failed:', error);
    return res.status(500).json({ error: 'Failed to analyze company', details: error?.message || 'Unknown error' });
  }
});

export default router; 