import express from 'express';
import { generateComprehensiveIBP } from '../../agents/claude';
import { getCachedResult, saveToCache, createSalesIntelligenceReport, getSalesIntelligenceReport } from '../database/init';
import { coerceToCompanyAnalysisSchema } from '../../agents/claude';

const router = express.Router();

// POST /api/company-analyze
router.post('/', async (req, res) => {
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

  // Check cache first
  const cachedResult = await getCachedResult(sanitizedUrl, true);
  if (cachedResult && !cachedResult.isExpired) {
    console.log(`[API] Returning cached result for ${sanitizedUrl}`);
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
            employeeRange: analysis.companyProfile?.companySize || 'Unknown',
            industryClassification: analysis.companyProfile?.industry || 'Technology',
            executiveTeam: []
          },
          marketIntelligence: {
            totalAddressableMarket: 'To be researched',
            customerSegments: analysis.decisionMakers || [],
            positioningStatement: analysis.goToMarketStrategy || '',
            competitiveLandscape: {
              directCompetitors: analysis.competitiveLandscape || [],
              differentiators: [],
              marketTrends: analysis.marketTrends || []
            }
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
            goToMarketStrategy: analysis.goToMarketStrategy || '',
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
            identifiedPainPoints: analysis.painPoints || [],
            triggerScore: 5
          }
        };

        console.log('[API] Creating sales intelligence report...');
        const reportId = await createSalesIntelligenceReport(
          analysis.companyName || 'Unknown Company',
          sanitizedUrl,
          reportData
        );
        
        console.log('[API] Saving to cache...');
        await saveToCache(sanitizedUrl, true, analysis, analysis, null, reportId);
        
        console.log('[API] Fetching full report...');
        const newReport = await getSalesIntelligenceReport(sanitizedUrl);
        
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

        const reportId = await createSalesIntelligenceReport(
          'Demo Company',
          sanitizedUrl,
          fallbackReportData
        );
        
        await saveToCache(sanitizedUrl, true, fallbackAnalysis, fallbackAnalysis, null, reportId);
        
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

export default router; 