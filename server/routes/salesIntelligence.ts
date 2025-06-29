import express from 'express';
import { 
  createSalesIntelligenceReport, 
  getSalesIntelligenceReport, 
  getTopSalesIntelligenceReports,
  updateApolloLeadMatches
} from '../database/init';
import { generateSalesIntelligenceReport } from '../../agents/salesIntelligenceAgent';

const router = express.Router();

// Generate comprehensive Sales Intelligence Report
router.post('/generate', async (req, res) => {
  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'Website URL is required'
      });
    }

    console.log(`🚀 Generating Sales Intelligence Report for: ${websiteUrl}`);
    
    // Check if report already exists
    const existingReport = await getSalesIntelligenceReport(websiteUrl);
    if (existingReport) {
      console.log(`📋 Found existing Sales Intelligence Report for ${websiteUrl}`);
      return res.json({
        success: true,
        data: existingReport,
        isCached: true,
        message: 'Report retrieved from database'
      });
    }

    // Generate new comprehensive report
    const reportData = await generateSalesIntelligenceReport(websiteUrl);
    
    // Save to database
    const reportId = await createSalesIntelligenceReport(
      reportData.companyOverview.companyName,
      websiteUrl,
      reportData
    );

    // Get the complete report with all related data
    const completeReport = await getSalesIntelligenceReport(websiteUrl);

    console.log(`✅ Sales Intelligence Report generated and saved (ID: ${reportId})`);

    res.json({
      success: true,
      data: completeReport,
      isCached: false,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('Error generating sales intelligence report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sales intelligence report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Sales Intelligence Report by URL
router.get('/report/:url', async (req, res) => {
  try {
    const { url } = req.params;
    const websiteUrl = decodeURIComponent(url);
    
    const report = await getSalesIntelligenceReport(websiteUrl);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Sales Intelligence Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error retrieving sales intelligence report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sales intelligence report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get top Sales Intelligence Reports
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const reports = await getTopSalesIntelligenceReports(limit);

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Error retrieving top sales intelligence reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve top sales intelligence reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update Apollo.io lead matches for a report
router.post('/apollo-matches', async (req, res) => {
  try {
    const { 
      reportId, 
      apolloCompanyId, 
      companyName, 
      matchedContacts, 
      icpFitScore, 
      intentScore 
    } = req.body;

    if (!reportId || !apolloCompanyId || !companyName) {
      return res.status(400).json({
        success: false,
        error: 'Report ID, Apollo Company ID, and Company Name are required'
      });
    }

    await updateApolloLeadMatches(
      reportId,
      apolloCompanyId,
      companyName,
      matchedContacts || [],
      icpFitScore || 0,
      intentScore || 0
    );

    res.json({
      success: true,
      message: 'Apollo lead matches updated successfully'
    });

  } catch (error) {
    console.error('Error updating Apollo lead matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update Apollo lead matches',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Sales Intelligence Report analytics
router.get('/analytics', async (req, res) => {
  try {
    const topReports = await getTopSalesIntelligenceReports(20);
    
    // Calculate analytics
    const analytics = {
      totalReports: topReports.length,
      averageICPFitScore: topReports.reduce((sum, report) => sum + (report.icpFitScore || 0), 0) / topReports.length,
      averageIBPMaturityScore: topReports.reduce((sum, report) => sum + (report.ibpMaturityScore || 0), 0) / topReports.length,
      averageSalesTriggerScore: topReports.reduce((sum, report) => sum + (report.salesTriggerScore || 0), 0) / topReports.length,
      averageTotalScore: topReports.reduce((sum, report) => sum + (report.totalScore || 0), 0) / topReports.length,
      priorityBreakdown: {
        high: topReports.filter(r => r.priority === 'high').length,
        medium: topReports.filter(r => r.priority === 'medium').length,
        low: topReports.filter(r => r.priority === 'low').length
      },
      topIndustries: getTopIndustries(topReports),
      topTechnologies: getTopTechnologies(topReports)
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search Sales Intelligence Reports
router.get('/search', async (req, res) => {
  try {
    const { query, industry, priority, minScore } = req.query;
    
    // This would implement search functionality
    // For now, return top reports
    const reports = await getTopSalesIntelligenceReports(50);
    
    let filteredReports = reports;
    
    if (query) {
      filteredReports = reports.filter(report => 
        report.companyName.toLowerCase().includes(query.toString().toLowerCase()) ||
        report.domain.toLowerCase().includes(query.toString().toLowerCase())
      );
    }
    
    if (industry) {
      filteredReports = filteredReports.filter(report => {
        const reportData = report.reportData;
        return reportData?.companyOverview?.industryClassification?.toLowerCase().includes(industry.toString().toLowerCase());
      });
    }
    
    if (priority) {
      filteredReports = filteredReports.filter(report => report.priority === priority);
    }
    
    if (minScore) {
      const minScoreNum = parseFloat(minScore.toString());
      filteredReports = filteredReports.filter(report => (report.totalScore || 0) >= minScoreNum);
    }

    res.json({
      success: true,
      data: filteredReports,
      count: filteredReports.length
    });

  } catch (error) {
    console.error('Error searching sales intelligence reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search sales intelligence reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions for analytics
function getTopIndustries(reports: any[]): string[] {
  const industryCount: { [key: string]: number } = {};
  
  reports.forEach(report => {
    const industry = report.reportData?.companyOverview?.industryClassification;
    if (industry) {
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    }
  });
  
  return Object.entries(industryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([industry]) => industry);
}

function getTopTechnologies(reports: any[]): string[] {
  const techCount: { [key: string]: number } = {};
  
  reports.forEach(report => {
    const technologies = report.reportData?.technologyStack?.integrations;
    if (technologies && Array.isArray(technologies)) {
      technologies.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    }
  });
  
  return Object.entries(techCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tech]) => tech);
}

export default router; 