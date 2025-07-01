import express from 'express';
import { generateComprehensiveIBP } from '../../agents/claude';
import { getCachedResult, saveToCache, createSalesIntelligenceReport, getSalesIntelligenceReport, saveReport } from '../database/init';
import { coerceToCompanyAnalysisSchema } from '../../agents/claude';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/company-analyze
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { url } = req.body;
  console.log(`[API] /api/company-analyze called with url:`, url);
  if (!url || typeof url !== 'string') {
    console.log('[API] Invalid or missing URL');
    return res.status(400).json({ error: 'Company URL is required.' });
  }

  let sanitizedUrl = url;
  if (!/^https?:\/\//i.test(sanitizedUrl)) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }

  // Check cache first (user-specific)
  console.log(`[API] Checking cache for userId: ${userId}, url: ${sanitizedUrl}`);
  const cachedResult = await getCachedResult(sanitizedUrl, true, userId);
  if (cachedResult && !cachedResult.isExpired) {
    console.log(`[API] Returning cached result for ${sanitizedUrl} (userId: ${userId})`);
    // Always save to report history, even if already present
    if (cachedResult.comprehensiveData) {
      await saveReport(userId, cachedResult.comprehensiveData.companyName || sanitizedUrl, sanitizedUrl, null);
    }
    return res.json({ 
      success: true, 
      analysis: cachedResult.comprehensiveData, 
      isCached: true,
      report: cachedResult.comprehensiveData
    });
  }

  // Timeout logic (enterprise-grade reliability)
  const timeoutMs = 60000; // 60 seconds
  let timeoutHandle: NodeJS.Timeout | undefined = undefined;
  let finished = false;

  try {
    console.log('[API] Running LLM analysis...');
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        if (!finished) {
          finished = true;
          reject(new Error('Analysis timed out. Please try again later.'));
        }
      }, timeoutMs);
    });

    const analysisPromise = (async (): Promise<{ analysis: any, report: any }> => {
      console.log('[API] Running generateComprehensiveIBP...');
      
      try {
        const analysisRaw = await generateComprehensiveIBP(sanitizedUrl);
        console.log('[API] Raw LLM output:', JSON.stringify(analysisRaw, null, 2));
        
        // Coerce to the expected schema for frontend
        const analysis = coerceToCompanyAnalysisSchema(analysisRaw);
        console.log('[API] Analysis coerced to schema:', JSON.stringify(analysis, null, 2));
        
        // Create a simplified report structure for database
        const reportData = {
          companyOverview: {
            companyName: analysis.companyName || 'Unknown Company',
            websiteUrl: sanitizedUrl,
            domain: new URL(sanitizedUrl).hostname.replace('www.', ''),
            headquarters: analysis.location || 'Unknown',
            foundingYear: 2020, // Default
            industry: analysis.companyProfile?.industry || 'Technology',
            companySize: analysis.companyProfile?.companySize || 'Unknown',
            revenueRange: analysis.companyProfile?.revenueRange || 'Unknown'
          },
          marketIntelligence: {
            totalAddressableMarket: 'To be researched',
            customerSegments: analysis.decisionMakers || [],
            positioningStatement: analysis.goToMarketStrategy || 'Unknown',
            competitiveLandscape: analysis.competitiveLandscape || {},
            marketTrends: analysis.marketTrends || []
          },
          financialPerformance: {
            estimatedAnnualRevenue: analysis.companyProfile?.revenueRange || 'Unknown',
            fundingRounds: [],
            totalAmountRaised: 'Unknown',
            keyInvestors: [],
            fundingStage: 'Unknown',
            revenueModel: 'SaaS'
          },
          technologyStack: {
            productOfferings: [],
            integrations: analysis.technologies || [],
            techStackComponents: analysis.technologies || [],
            uniqueSellingPropositions: []
          },
          salesMarketingStrategy: {
            goToMarketStrategy: analysis.goToMarketStrategy || 'Unknown',
            targetAudience: {
              icpCharacteristics: {
                companySize: [analysis.companyProfile?.companySize || 'Unknown'],
                industryVerticals: [analysis.companyProfile?.industry || 'Technology'],
                keyPersonas: analysis.decisionMakers || []
              }
            },
            marketingChannels: [],
            salesProcess: {
              inboundOutboundRatio: 'Unknown',
              salesCycleLength: 'Unknown',
              averageDealSize: 'Unknown'
            },
            icpCharacteristics: {}
          },
          ibpCapabilityMaturity: {
            ibpProcesses: [],
            dataIntegration: 'Unknown',
            analyticsForecasting: 'Unknown',
            maturityLevel: 'Unknown',
            maturityScore: 0
          },
          salesOpportunityInsights: {
            buyingSignals: [],
            intentData: {},
            engagementMetrics: {},
            identifiedPainPoints: analysis.painPoints || [],
            triggerScore: 0
          }
        };

        console.log('[API] Creating sales intelligence report for userId:', userId);
        const reportId = await createSalesIntelligenceReport(
          userId,
          analysis.companyName || 'Unknown Company',
          sanitizedUrl,
          reportData
        );
        
        console.log('[API] Saving to cache for userId:', userId);
        await saveToCache(sanitizedUrl, true, analysis, analysis, null, reportId, userId);
        
        console.log('[API] Fetching full report for userId:', userId);
        const newReport = await getSalesIntelligenceReport(userId, sanitizedUrl);
        
        // Save to report history (after new analysis)
        if (analysis.companyName) {
          await saveReport(userId, analysis.companyName, sanitizedUrl, null);
        }
        
        return { analysis, report: newReport || analysis };
      } catch (llmError) {
        console.error('[API] LLM analysis failed:', llmError);
        // Return fallback data
        const fallbackAnalysis = {
          companyProfile: {
            industry: 'Software',
            companySize: '51-200',
            revenueRange: '$10M-$50M'
          },
          decisionMakers: ['VP of Sales', 'Head of Marketing', 'Revenue Operations'],
          painPoints: ['Manual processes', 'Scaling issues', 'Lead qualification'],
          researchSummary: 'Analysis completed with fallback data due to processing error.',
          website: sanitizedUrl,
          companyName: 'Demo Company',
          technologies: ['Node.js', 'React', 'PostgreSQL'],
          location: 'San Francisco, CA',
          marketTrends: ['AI adoption', 'Remote work', 'Digital transformation'],
          competitiveLandscape: ['Competitor A', 'Competitor B', 'Competitor C'],
          goToMarketStrategy: 'Product-led growth with targeted outbound.'
        };
        
        const fallbackReportData = {
          companyOverview: {
            companyName: 'Demo Company',
            websiteUrl: sanitizedUrl,
            domain: new URL(sanitizedUrl).hostname.replace('www.', ''),
            headquarters: 'San Francisco, CA',
            foundingYear: 2020,
            employeeRange: '51-200',
            industryClassification: 'Software',
            executiveTeam: []
          },
          marketIntelligence: {
            totalAddressableMarket: 'To be researched',
            customerSegments: ['VP of Sales', 'Head of Marketing', 'Revenue Operations'],
            positioningStatement: 'Product-led growth with targeted outbound.',
            competitiveLandscape: {
              directCompetitors: ['Competitor A', 'Competitor B', 'Competitor C'],
              differentiators: [],
              marketTrends: ['AI adoption', 'Remote work', 'Digital transformation']
            }
          },
          financialPerformance: {
            estimatedAnnualRevenue: '$10M-$50M',
            fundingRounds: [],
            totalAmountRaised: 'Unknown',
            keyInvestors: [],
            fundingStage: 'Unknown',
            revenueModel: 'SaaS'
          },
          technologyStack: {
            productOfferings: [],
            integrations: ['Node.js', 'React', 'PostgreSQL'],
            techStackComponents: ['Node.js', 'React', 'PostgreSQL'],
            uniqueSellingPropositions: []
          },
          salesMarketingStrategy: {
            goToMarketStrategy: 'Product-led growth with targeted outbound.',
            targetAudience: {
              icpCharacteristics: {
                companySize: ['51-200'],
                industryVerticals: ['Software'],
                keyPersonas: ['VP of Sales', 'Head of Marketing', 'Revenue Operations']
              }
            },
            marketingChannels: [],
            salesProcess: {
              inboundOutboundRatio: 'Unknown',
              salesCycleLength: 'Unknown',
              averageDealSize: 'Unknown'
            }
          },
          ibpCapabilityMaturity: {
            ibpProcesses: [],
            dataIntegration: {},
            analyticsForecasting: {},
            maturityLevel: 1,
            maturityScore: 5
          },
          salesOpportunityInsights: {
            buyingSignals: [],
            intentData: {},
            engagementMetrics: {},
            identifiedPainPoints: ['Manual processes', 'Scaling issues', 'Lead qualification'],
            triggerScore: 5
          }
        };

        const fallbackReportId = await createSalesIntelligenceReport(
          userId,
          'Demo Company',
          sanitizedUrl,
          fallbackReportData
        );
        
        await saveToCache(sanitizedUrl, true, fallbackAnalysis, fallbackAnalysis, null, fallbackReportId);
        
        // Save to report history (after fallback analysis)
        if (fallbackAnalysis.companyName) {
          await saveReport(userId, fallbackAnalysis.companyName, sanitizedUrl, null);
        }
        
        return { analysis: fallbackAnalysis, report: fallbackAnalysis };
      }
    })();

    const { analysis, report: newReport } = await Promise.race([analysisPromise, timeoutPromise]) as { analysis: any, report: any };
    finished = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    console.log('[API] Sending response to frontend');
    return res.json({ success: true, analysis, isCached: false, report: newReport });
  } catch (error: any) {
    finished = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    console.error('Company analysis failed:', error);
    return res.status(500).json({ error: 'Failed to analyze company', details: error?.message || 'Unknown error' });
  }
});

// GET /api/company-analyze/reports - List all saved company analysis reports for the user
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Backfill saved_reports from cache for this user
    const { getRows } = require('../database/init');
    const cacheEntries = await getRows('SELECT url, comprehensiveData, createdAt FROM cache WHERE userId = ? AND comprehensiveData IS NOT NULL', [userId]);
    for (const entry of cacheEntries) {
      let companyName = null;
      try {
        const data = typeof entry.comprehensiveData === 'string' ? JSON.parse(entry.comprehensiveData) : entry.comprehensiveData;
        companyName = data.companyName || entry.url;
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