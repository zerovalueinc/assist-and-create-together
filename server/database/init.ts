import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Use CommonJS path resolution
const dbPath = path.join(__dirname, '../../data/personaops.db');

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath);

export async function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create ICPs table
      db.run(`
        CREATE TABLE IF NOT EXISTS icps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          industry TEXT,
          funding TEXT,
          painPoints TEXT,
          persona TEXT,
          technologies TEXT,
          validUseCase TEXT,
          companySize TEXT,
          jobTitles TEXT,
          locationCountry TEXT,
          industries TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create Leads table
      db.run(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstName TEXT,
          lastName TEXT,
          fullName TEXT,
          title TEXT,
          email TEXT,
          linkedInUrl TEXT,
          companyName TEXT,
          companyWebsite TEXT,
          confidenceScore REAL,
          icpId INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (icpId) REFERENCES icps(id)
        )
      `);

      // Create EnrichedLeads table
      db.run(`
        CREATE TABLE IF NOT EXISTS enriched_leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          leadId INTEGER,
          bio TEXT,
          interests TEXT,
          oneSentenceWhyTheyCare TEXT,
          enrichedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (leadId) REFERENCES leads(id)
        )
      `);

      // Create EmailTemplates table
      db.run(`
        CREATE TABLE IF NOT EXISTS email_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          leadId INTEGER,
          subject TEXT,
          body TEXT,
          tone TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (leadId) REFERENCES leads(id)
        )
      `);

      // Create Sessions table for storing pipeline state
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sessionId TEXT UNIQUE,
          icpId INTEGER,
          status TEXT,
          data TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (icpId) REFERENCES icps(id)
        )
      `);

      // Create Cache table for storing ICP/IBP results
      db.run(`
        CREATE TABLE IF NOT EXISTS cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT UNIQUE,
          isComprehensive BOOLEAN DEFAULT 0,
          icpData TEXT,
          comprehensiveData TEXT,
          icpId INTEGER,
          expiresAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          lastAccessed DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (icpId) REFERENCES icps(id)
        )
      `);

      // Create Sales Intelligence Reports table
      db.run(`
        CREATE TABLE IF NOT EXISTS sales_intelligence_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          companyName TEXT,
          websiteUrl TEXT UNIQUE,
          domain TEXT,
          reportData TEXT,
          icpFitScore REAL,
          ibpMaturityScore REAL,
          salesTriggerScore REAL,
          totalScore REAL,
          priority TEXT,
          status TEXT DEFAULT 'active',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create Company Overview table
      db.run(`
        CREATE TABLE IF NOT EXISTS company_overview (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          companyName TEXT,
          websiteUrl TEXT,
          domain TEXT,
          headquarters TEXT,
          foundingYear INTEGER,
          employeeRange TEXT,
          industryClassification TEXT,
          executiveTeam TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Market Intelligence table
      db.run(`
        CREATE TABLE IF NOT EXISTS market_intelligence (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          totalAddressableMarket TEXT,
          customerSegments TEXT,
          positioningStatement TEXT,
          competitiveLandscape TEXT,
          marketTrends TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Financial Performance table
      db.run(`
        CREATE TABLE IF NOT EXISTS financial_performance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          estimatedAnnualRevenue TEXT,
          fundingRounds TEXT,
          totalAmountRaised TEXT,
          keyInvestors TEXT,
          fundingStage TEXT,
          revenueModel TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Technology Stack table
      db.run(`
        CREATE TABLE IF NOT EXISTS technology_stack (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          productOfferings TEXT,
          integrations TEXT,
          techStackComponents TEXT,
          uniqueSellingPropositions TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Sales Marketing Strategy table
      db.run(`
        CREATE TABLE IF NOT EXISTS sales_marketing_strategy (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          goToMarketStrategy TEXT,
          targetAudience TEXT,
          marketingChannels TEXT,
          salesProcess TEXT,
          icpCharacteristics TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create IBP Capability Maturity table
      db.run(`
        CREATE TABLE IF NOT EXISTS ibp_capability_maturity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          ibpProcesses TEXT,
          dataIntegration TEXT,
          analyticsForecasting TEXT,
          maturityLevel INTEGER,
          maturityScore REAL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Sales Opportunity Insights table
      db.run(`
        CREATE TABLE IF NOT EXISTS sales_opportunity_insights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          buyingSignals TEXT,
          intentData TEXT,
          engagementMetrics TEXT,
          identifiedPainPoints TEXT,
          triggerScore REAL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Apollo.io Integration table for lead matching
      db.run(`
        CREATE TABLE IF NOT EXISTS apollo_lead_matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reportId INTEGER,
          apolloCompanyId TEXT,
          companyName TEXT,
          matchedContacts TEXT,
          icpFitScore REAL,
          intentScore REAL,
          priority TEXT,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reportId) REFERENCES sales_intelligence_reports(id)
        )
      `);

      // Create Saved Reports table
      db.run(`
        CREATE TABLE IF NOT EXISTS saved_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          companyName TEXT,
          url TEXT UNIQUE,
          icpId INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (icpId) REFERENCES icps(id)
        )
      `);

      // Create Campaigns table for tracking email campaigns
      db.run(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          leadIds TEXT,
          templateId INTEGER,
          status TEXT DEFAULT 'draft',
          sentAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (templateId) REFERENCES email_templates(id)
        )
      `);

      db.run('PRAGMA foreign_keys = ON', (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables created successfully');
          resolve();
        }
      });
    });
  });
}

// Helper function to run queries with promises
export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to get single row
export function getRow(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to get multiple rows
export function getRows(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper to check if a cache entry is expired
export function isCacheExpired(cacheEntry: any): boolean {
  if (!cacheEntry || !cacheEntry.expiresAt) return true;
  return new Date(cacheEntry.expiresAt) < new Date();
}

// Updated getCachedResult: returns expired entries with a flag
export async function getCachedResult(url: string, isComprehensive: boolean = false): Promise<any | null> {
  try {
    await runQuery('CREATE INDEX IF NOT EXISTS idx_cache_url_comprehensive ON cache(url, isComprehensive)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expiresAt)');
    const cacheEntry = await getRow(
      'SELECT * FROM cache WHERE url = ? AND isComprehensive = ?',
      [url, isComprehensive ? 1 : 0]
    );
    if (cacheEntry) {
      await runQuery('UPDATE cache SET lastAccessed = datetime("now") WHERE id = ?', [cacheEntry.id]);
      const expired = isCacheExpired(cacheEntry);
      return {
        icpData: cacheEntry.icpData ? JSON.parse(cacheEntry.icpData) : null,
        comprehensiveData: cacheEntry.comprehensiveData ? JSON.parse(cacheEntry.comprehensiveData) : null,
        icpId: cacheEntry.icpId,
        isCached: !expired,
        isExpired: expired,
        cachedAt: cacheEntry.createdAt,
        expiresAt: cacheEntry.expiresAt
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting cached result:', error);
    return null;
  }
}

// Updated saveToCache: always upsert, never delete
export async function saveToCache(
  url: string,
  isComprehensive: boolean,
  icpData: any,
  comprehensiveData: any = null,
  icpId: number
): Promise<void> {
  try {
    // Always upsert, never delete
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await runQuery(
      `INSERT OR REPLACE INTO cache 
       (url, isComprehensive, icpData, comprehensiveData, icpId, expiresAt, lastAccessed) 
       VALUES (?, ?, ?, ?, ?, ?, datetime("now"))`,
      [
        url,
        isComprehensive ? 1 : 0,
        JSON.stringify(icpData),
        comprehensiveData ? JSON.stringify(comprehensiveData) : null,
        icpId,
        expiresAt.toISOString()
      ]
    );
    console.log(`💾 Cached result for ${url} (${isComprehensive ? 'comprehensive' : 'basic'}) - Expires in 30 days`);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

export async function cleanupExpiredCache(): Promise<void> {
  try {
    const result = await runQuery(
      'DELETE FROM cache WHERE expiresAt < datetime("now")'
    );
    
    if (result.changes > 0) {
      console.log(`🧹 Cleaned up ${result.changes} expired cache entries`);
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}

// NEW: Cache analytics for monitoring efficiency
export async function getCacheStats(): Promise<any> {
  try {
    const totalEntries = await getRow('SELECT COUNT(*) as count FROM cache');
    const activeEntries = await getRow('SELECT COUNT(*) as count FROM cache WHERE expiresAt > datetime("now")');
    const expiredEntries = await getRow('SELECT COUNT(*) as count FROM cache WHERE expiresAt <= datetime("now")');
    const mostAccessed = await getRows(`
      SELECT url, isComprehensive, lastAccessed, createdAt 
      FROM cache 
      WHERE expiresAt > datetime("now") 
      ORDER BY lastAccessed DESC 
      LIMIT 5
    `);
    
    return {
      totalEntries: totalEntries.count,
      activeEntries: activeEntries.count,
      expiredEntries: expiredEntries.count,
      cacheHitRate: totalEntries.count > 0 ? (activeEntries.count / totalEntries.count * 100).toFixed(2) + '%' : '0%',
      mostAccessed
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
}

// NEW: Bulk cache operations for efficiency
export async function bulkCacheCleanup(): Promise<void> {
  try {
    // Clean up expired entries
    await cleanupExpiredCache();
    
    // Optimize database
    await runQuery('VACUUM');
    await runQuery('ANALYZE');
    
    console.log('🔧 Database optimized for maximum performance');
  } catch (error) {
    console.error('Error in bulk cache cleanup:', error);
  }
}

// NEW: Cache warming for popular URLs
export async function warmCacheForPopularUrls(): Promise<void> {
  try {
    const popularUrls = [
      'https://www.notion.so',
      'https://www.slack.com',
      'https://www.salesforce.com',
      'https://www.hubspot.com',
      'https://www.atlassian.com'
    ];

    console.log('🔥 Warming cache for popular URLs...');
    
    for (const url of popularUrls) {
      const existing = await getCachedResult(url, true);
      if (!existing) {
        console.log(`🔥 Warming cache for: ${url}`);
        // This would trigger the comprehensive IBP generation
        // For now, just log the intent
      }
    }
    
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('Error warming cache:', error);
  }
}

// Sales Intelligence Report Helper Functions
export async function createSalesIntelligenceReport(
  companyName: string,
  websiteUrl: string,
  reportData: any
): Promise<number> {
  try {
    const domain = new URL(websiteUrl).hostname.replace('www.', '');
    
    // Calculate scores
    const icpFitScore = calculateICPFitScore(reportData);
    const ibpMaturityScore = calculateIBPMaturityScore(reportData);
    const salesTriggerScore = calculateSalesTriggerScore(reportData);
    const totalScore = (icpFitScore * 0.4) + (ibpMaturityScore * 0.3) + (salesTriggerScore * 0.3);
    
    // Determine priority
    const priority = totalScore >= 8 ? 'high' : totalScore >= 6 ? 'medium' : 'low';
    
    const result = await runQuery(
      `INSERT INTO sales_intelligence_reports 
       (companyName, websiteUrl, domain, reportData, icpFitScore, ibpMaturityScore, salesTriggerScore, totalScore, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyName, websiteUrl, domain, JSON.stringify(reportData), icpFitScore, ibpMaturityScore, salesTriggerScore, totalScore, priority]
    );
    
    const reportId = result.id;
    
    // Insert detailed data into related tables
    await insertCompanyOverview(reportId, reportData.companyOverview);
    await insertMarketIntelligence(reportId, reportData.marketIntelligence);
    await insertFinancialPerformance(reportId, reportData.financialPerformance);
    await insertTechnologyStack(reportId, reportData.technologyStack);
    await insertSalesMarketingStrategy(reportId, reportData.salesMarketingStrategy);
    await insertIBPCapabilityMaturity(reportId, reportData.ibpCapabilityMaturity);
    await insertSalesOpportunityInsights(reportId, reportData.salesOpportunityInsights);
    
    console.log(`💾 Created Sales Intelligence Report for ${companyName} (ID: ${reportId})`);
    return reportId;
  } catch (error) {
    console.error('Error creating sales intelligence report:', error);
    throw error;
  }
}

export async function getSalesIntelligenceReport(websiteUrl: string): Promise<any | null> {
  try {
    const report = await getRow(
      'SELECT * FROM sales_intelligence_reports WHERE websiteUrl = ?',
      [websiteUrl]
    );
    
    if (!report) return null;
    
    // Get related data
    const companyOverview = await getRow('SELECT * FROM company_overview WHERE reportId = ?', [report.id]);
    const marketIntelligence = await getRow('SELECT * FROM market_intelligence WHERE reportId = ?', [report.id]);
    const financialPerformance = await getRow('SELECT * FROM financial_performance WHERE reportId = ?', [report.id]);
    const technologyStack = await getRow('SELECT * FROM technology_stack WHERE reportId = ?', [report.id]);
    const salesMarketingStrategy = await getRow('SELECT * FROM sales_marketing_strategy WHERE reportId = ?', [report.id]);
    const ibpCapabilityMaturity = await getRow('SELECT * FROM ibp_capability_maturity WHERE reportId = ?', [report.id]);
    const salesOpportunityInsights = await getRow('SELECT * FROM sales_opportunity_insights WHERE reportId = ?', [report.id]);
    const apolloLeadMatches = await getRows('SELECT * FROM apollo_lead_matches WHERE reportId = ?', [report.id]);
    
    return {
      ...report,
      reportData: JSON.parse(report.reportData),
      companyOverview,
      marketIntelligence,
      financialPerformance,
      technologyStack,
      salesMarketingStrategy,
      ibpCapabilityMaturity,
      salesOpportunityInsights,
      apolloLeadMatches
    };
  } catch (error) {
    console.error('Error getting sales intelligence report:', error);
    return null;
  }
}

export async function getTopSalesIntelligenceReports(limit: number = 10): Promise<any[]> {
  try {
    const reports = await getRows(
      'SELECT * FROM sales_intelligence_reports WHERE status = "active" ORDER BY totalScore DESC LIMIT ?',
      [limit]
    );
    
    return reports.map(report => ({
      ...report,
      reportData: JSON.parse(report.reportData)
    }));
  } catch (error) {
    console.error('Error getting top sales intelligence reports:', error);
    return [];
  }
}

export async function updateApolloLeadMatches(
  reportId: number,
  apolloCompanyId: string,
  companyName: string,
  matchedContacts: any[],
  icpFitScore: number,
  intentScore: number
): Promise<void> {
  try {
    const priority = (icpFitScore + intentScore) / 2 >= 8 ? 'high' : (icpFitScore + intentScore) / 2 >= 6 ? 'medium' : 'low';
    
    await runQuery(
      `INSERT OR REPLACE INTO apollo_lead_matches 
       (reportId, apolloCompanyId, companyName, matchedContacts, icpFitScore, intentScore, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [reportId, apolloCompanyId, companyName, JSON.stringify(matchedContacts), icpFitScore, intentScore, priority]
    );
    
    console.log(`🔗 Updated Apollo lead matches for ${companyName}`);
  } catch (error) {
    console.error('Error updating Apollo lead matches:', error);
  }
}

// Scoring Functions
function calculateICPFitScore(data: any): number {
  let score = 0;
  const weights = {
    industryAlignment: 0.2,
    companySize: 0.15,
    technologyStackCompatibility: 0.15,
    ibpMaturityLevel: 0.2,
    identifiedPainPoints: 0.15,
    engagementLevel: 0.15
  };
  
  // Industry Alignment (0-10)
  if (data.marketIntelligence?.industryClassification) {
    score += weights.industryAlignment * 8;
  }
  
  // Company Size (0-10)
  if (data.companyOverview?.employeeRange) {
    const size = data.companyOverview.employeeRange;
    if (size.includes('51-200') || size.includes('201-1000')) {
      score += weights.companySize * 9;
    } else if (size.includes('11-50') || size.includes('1001-5000')) {
      score += weights.companySize * 7;
    } else {
      score += weights.companySize * 5;
    }
  }
  
  // Technology Stack Compatibility (0-10)
  if (data.technologyStack?.integrations) {
    const integrations = JSON.parse(data.technologyStack.integrations || '[]');
    if (integrations.length >= 3) {
      score += weights.technologyStackCompatibility * 8;
    } else if (integrations.length >= 1) {
      score += weights.technologyStackCompatibility * 6;
    }
  }
  
  // IBP Maturity Level (0-10)
  if (data.ibpCapabilityMaturity?.maturityScore) {
    score += weights.ibpMaturityLevel * data.ibpCapabilityMaturity.maturityScore;
  }
  
  // Identified Pain Points (0-10)
  if (data.salesOpportunityInsights?.identifiedPainPoints) {
    const painPoints = JSON.parse(data.salesOpportunityInsights.identifiedPainPoints || '[]');
    score += weights.identifiedPainPoints * Math.min(10, painPoints.length * 2);
  }
  
  // Engagement Level (0-10)
  if (data.salesOpportunityInsights?.engagementMetrics) {
    score += weights.engagementLevel * 7; // Default moderate engagement
  }
  
  return Math.min(10, Math.max(0, score));
}

function calculateIBPMaturityScore(data: any): number {
  let score = 0;
  
  // IBP Processes (0-4 points)
  if (data.ibpCapabilityMaturity?.ibpProcesses) {
    const processes = JSON.parse(data.ibpCapabilityMaturity.ibpProcesses || '[]');
    score += Math.min(4, processes.length);
  }
  
  // Data Integration (0-3 points)
  if (data.ibpCapabilityMaturity?.dataIntegration) {
    const integration = JSON.parse(data.ibpCapabilityMaturity.dataIntegration || '{}');
    if (integration.dataCentralizationPercentage > 80) {
      score += 3;
    } else if (integration.dataCentralizationPercentage > 50) {
      score += 2;
    } else {
      score += 1;
    }
  }
  
  // Analytics & Forecasting (0-3 points)
  if (data.ibpCapabilityMaturity?.analyticsForecasting) {
    const analytics = JSON.parse(data.ibpCapabilityMaturity.analyticsForecasting || '{}');
    if (analytics.useOfAdvancedAnalytics) {
      score += 2;
    }
    if (analytics.forecastAccuracyPercentage > 80) {
      score += 1;
    }
  }
  
  return Math.min(10, score);
}

function calculateSalesTriggerScore(data: any): number {
  let score = 0;
  
  // Buying Signals (0-4 points)
  if (data.salesOpportunityInsights?.buyingSignals) {
    const signals = JSON.parse(data.salesOpportunityInsights.buyingSignals || '[]');
    score += Math.min(4, signals.length);
  }
  
  // Intent Data (0-3 points)
  if (data.salesOpportunityInsights?.intentData) {
    const intent = JSON.parse(data.salesOpportunityInsights.intentData || '{}');
    if (intent.websiteVisits > 1000) {
      score += 2;
    } else if (intent.websiteVisits > 100) {
      score += 1;
    }
    if (intent.contentDownloads > 5) {
      score += 1;
    }
  }
  
  // Engagement Metrics (0-3 points)
  if (data.salesOpportunityInsights?.engagementMetrics) {
    const engagement = JSON.parse(data.salesOpportunityInsights.engagementMetrics || '{}');
    if (engagement.emailOpenRate > 25) {
      score += 1;
    }
    if (engagement.clickThroughRate > 3) {
      score += 1;
    }
    if (engagement.eventAttendance > 0) {
      score += 1;
    }
  }
  
  return Math.min(10, score);
}

// Helper functions for inserting detailed data
async function insertCompanyOverview(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO company_overview 
     (reportId, companyName, websiteUrl, domain, headquarters, foundingYear, employeeRange, industryClassification, executiveTeam) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reportId,
      data.companyName,
      data.websiteUrl,
      data.domain,
      data.headquarters,
      data.foundingYear,
      data.employeeRange,
      data.industryClassification,
      JSON.stringify(data.executiveTeam || [])
    ]
  );
}

async function insertMarketIntelligence(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO market_intelligence 
     (reportId, totalAddressableMarket, customerSegments, positioningStatement, competitiveLandscape, marketTrends) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      reportId,
      data.totalAddressableMarket,
      JSON.stringify(data.customerSegments || []),
      data.positioningStatement,
      JSON.stringify(data.competitiveLandscape || {}),
      JSON.stringify(data.marketTrends || [])
    ]
  );
}

async function insertFinancialPerformance(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO financial_performance 
     (reportId, estimatedAnnualRevenue, fundingRounds, totalAmountRaised, keyInvestors, fundingStage, revenueModel) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      reportId,
      data.estimatedAnnualRevenue,
      JSON.stringify(data.fundingRounds || []),
      data.totalAmountRaised,
      JSON.stringify(data.keyInvestors || []),
      data.fundingStage,
      data.revenueModel
    ]
  );
}

async function insertTechnologyStack(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO technology_stack 
     (reportId, productOfferings, integrations, techStackComponents, uniqueSellingPropositions) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      reportId,
      JSON.stringify(data.productOfferings || []),
      JSON.stringify(data.integrations || []),
      JSON.stringify(data.techStackComponents || []),
      JSON.stringify(data.uniqueSellingPropositions || [])
    ]
  );
}

async function insertSalesMarketingStrategy(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO sales_marketing_strategy 
     (reportId, goToMarketStrategy, targetAudience, marketingChannels, salesProcess, icpCharacteristics) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      reportId,
      data.goToMarketStrategy,
      JSON.stringify(data.targetAudience || {}),
      JSON.stringify(data.marketingChannels || []),
      JSON.stringify(data.salesProcess || {}),
      JSON.stringify(data.icpCharacteristics || {})
    ]
  );
}

async function insertIBPCapabilityMaturity(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO ibp_capability_maturity 
     (reportId, ibpProcesses, dataIntegration, analyticsForecasting, maturityLevel, maturityScore) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      reportId,
      JSON.stringify(data.ibpProcesses || []),
      JSON.stringify(data.dataIntegration || {}),
      JSON.stringify(data.analyticsForecasting || {}),
      data.maturityLevel || 1,
      data.maturityScore || 0
    ]
  );
}

async function insertSalesOpportunityInsights(reportId: number, data: any): Promise<void> {
  if (!data) return;
  
  await runQuery(
    `INSERT INTO sales_opportunity_insights 
     (reportId, buyingSignals, intentData, engagementMetrics, identifiedPainPoints, triggerScore) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      reportId,
      JSON.stringify(data.buyingSignals || []),
      JSON.stringify(data.intentData || {}),
      JSON.stringify(data.engagementMetrics || {}),
      JSON.stringify(data.identifiedPainPoints || []),
      data.triggerScore || 0
    ]
  );
}

// Helper to save a report
export async function saveReport(companyName: string, url: string, icpId: number): Promise<void> {
  await runQuery(
    `INSERT OR IGNORE INTO saved_reports (companyName, url, icpId) VALUES (?, ?, ?)`,
    [companyName, url, icpId]
  );
}

// Helper to get all saved reports
export async function getSavedReports(): Promise<any[]> {
  return getRows('SELECT * FROM saved_reports ORDER BY createdAt DESC');
}

// Helper to get a saved report by URL
export async function getSavedReportByUrl(url: string): Promise<any | null> {
  return getRow('SELECT * FROM saved_reports WHERE url = ?', [url]);
}

// NEW: Enhanced database operations for sales intelligence platform

// Get comprehensive database statistics
export async function getDatabaseStats(): Promise<any> {
  try {
    const stats = {
      icps: await getRow('SELECT COUNT(*) as count FROM icps'),
      leads: await getRow('SELECT COUNT(*) as count FROM leads'),
      reports: await getRow('SELECT COUNT(*) as count FROM sales_intelligence_reports'),
      campaigns: await getRow('SELECT COUNT(*) as count FROM email_templates'),
      cache: await getRow('SELECT COUNT(*) as count FROM cache'),
      apolloMatches: await getRow('SELECT COUNT(*) as count FROM apollo_lead_matches'),
      enrichedLeads: await getRow('SELECT COUNT(*) as count FROM enriched_leads'),
      savedReports: await getRow('SELECT COUNT(*) as count FROM saved_reports')
    };

    return {
      totalRecords: Object.values(stats).reduce((sum: number, stat: any) => sum + stat.count, 0),
      breakdown: {
        icps: stats.icps.count,
        leads: stats.leads.count,
        reports: stats.reports.count,
        campaigns: stats.campaigns.count,
        cache: stats.cache.count,
        apolloMatches: stats.apolloMatches.count,
        enrichedLeads: stats.enrichedLeads.count,
        savedReports: stats.savedReports.count
      }
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { error: 'Failed to get database stats' };
  }
}

// Get analytics and reporting data
export async function getAnalyticsData(timeframe: string = '30d'): Promise<any> {
  try {
    const dateFilter = timeframe === '7d' ? 'datetime("now", "-7 days")' :
                      timeframe === '30d' ? 'datetime("now", "-30 days")' :
                      timeframe === '90d' ? 'datetime("now", "-90 days")' : 'datetime("now", "-30 days")';

    const analytics = {
      icpsGenerated: await getRow(`SELECT COUNT(*) as count FROM icps WHERE createdAt >= ${dateFilter}`),
      leadsFound: await getRow(`SELECT COUNT(*) as count FROM leads WHERE createdAt >= ${dateFilter}`),
      reportsCreated: await getRow(`SELECT COUNT(*) as count FROM sales_intelligence_reports WHERE createdAt >= ${dateFilter}`),
      campaignsSent: await getRow(`SELECT COUNT(*) as count FROM email_templates WHERE createdAt >= ${dateFilter}`),
      cacheHits: await getRow(`SELECT COUNT(*) as count FROM cache WHERE lastAccessed >= ${dateFilter}`),
      topIndustries: await getRows(`
        SELECT industry, COUNT(*) as count 
        FROM icps 
        WHERE createdAt >= ${dateFilter}
        GROUP BY industry 
        ORDER BY count DESC 
        LIMIT 5
      `),
      topCompanies: await getRows(`
        SELECT companyName, COUNT(*) as count 
        FROM leads 
        WHERE createdAt >= ${dateFilter}
        GROUP BY companyName 
        ORDER BY count DESC 
        LIMIT 5
      `),
      averageScores: await getRow(`
        SELECT 
          AVG(icpFitScore) as avgIcpFit,
          AVG(ibpMaturityScore) as avgIbpMaturity,
          AVG(salesTriggerScore) as avgSalesTrigger,
          AVG(totalScore) as avgTotal
        FROM sales_intelligence_reports 
        WHERE createdAt >= ${dateFilter}
      `)
    };

    return {
      timeframe,
      summary: {
        icpsGenerated: analytics.icpsGenerated.count,
        leadsFound: analytics.leadsFound.count,
        reportsCreated: analytics.reportsCreated.count,
        campaignsSent: analytics.campaignsSent.count,
        cacheHits: analytics.cacheHits.count
      },
      insights: {
        topIndustries: analytics.topIndustries,
        topCompanies: analytics.topCompanies,
        averageScores: analytics.averageScores
      }
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return { error: 'Failed to get analytics data' };
  }
}

// Enhanced lead enrichment operations
export async function enrichLead(leadId: number, enrichmentData: any): Promise<void> {
  try {
    const { bio, interests, oneSentenceWhyTheyCare, socialProfiles, recentActivity } = enrichmentData;
    
    // Check if enrichment already exists
    const existing = await getRow('SELECT id FROM enriched_leads WHERE leadId = ?', [leadId]);
    
    if (existing) {
      // Update existing enrichment
      await runQuery(`
        UPDATE enriched_leads 
        SET bio = ?, interests = ?, oneSentenceWhyTheyCare = ?, socialProfiles = ?, recentActivity = ?, enrichedAt = datetime("now")
        WHERE leadId = ?
      `, [
        bio,
        interests,
        oneSentenceWhyTheyCare,
        JSON.stringify(socialProfiles || {}),
        JSON.stringify(recentActivity || []),
        leadId
      ]);
    } else {
      // Create new enrichment
      await runQuery(`
        INSERT INTO enriched_leads (leadId, bio, interests, oneSentenceWhyTheyCare, socialProfiles, recentActivity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        leadId,
        bio,
        interests,
        oneSentenceWhyTheyCare,
        JSON.stringify(socialProfiles || {}),
        JSON.stringify(recentActivity || [])
      ]);
    }
    
    console.log(`✅ Lead ${leadId} enriched successfully`);
  } catch (error) {
    console.error('Error enriching lead:', error);
    throw new Error('Failed to enrich lead');
  }
}

// Bulk lead enrichment
export async function bulkEnrichLeads(leadIds: number[]): Promise<any> {
  try {
    const results: Array<{
      leadId: number;
      success?: boolean;
      error?: string;
    }> = [];
    let successCount = 0;
    let errorCount = 0;

    for (const leadId of leadIds) {
      try {
        // Get lead data for enrichment
        const lead = await getRow('SELECT * FROM leads WHERE id = ?', [leadId]);
        if (!lead) {
          results.push({ leadId, error: 'Lead not found' });
          errorCount++;
          continue;
        }

        // Mock enrichment data (in real implementation, this would come from enrichment services)
        const enrichmentData = {
          bio: `Experienced ${lead.title} at ${lead.companyName}`,
          interests: ['Business growth', 'Technology', 'Innovation'],
          oneSentenceWhyTheyCare: `As a ${lead.title}, they likely care about business efficiency and growth.`,
          socialProfiles: {
            linkedin: lead.linkedInUrl || null,
            twitter: null
          },
          recentActivity: [
            { type: 'company_update', description: 'Company growth', date: new Date().toISOString() }
          ]
        };

        await enrichLead(leadId, enrichmentData);
        results.push({ leadId, success: true });
        successCount++;

      } catch (leadError) {
        errorCount++;
        results.push({ 
          leadId, 
          error: leadError instanceof Error ? leadError.message : 'Unknown error'
        });
      }
    }

    return {
      total: leadIds.length,
      success: successCount,
      errors: errorCount,
      results
    };
  } catch (error) {
    console.error('Error in bulk lead enrichment:', error);
    throw new Error('Failed to bulk enrich leads');
  }
}

// Campaign tracking and analytics
export async function trackCampaign(campaignData: {
  name: string;
  leadIds: number[];
  templateId: number;
  status: string;
  sentAt?: string;
}): Promise<number> {
  try {
    const { name, leadIds, templateId, status, sentAt } = campaignData;
    
    const result = await runQuery(`
      INSERT INTO campaigns (name, leadIds, templateId, status, sentAt)
      VALUES (?, ?, ?, ?, ?)
    `, [
      name,
      JSON.stringify(leadIds),
      templateId,
      status,
      sentAt || new Date().toISOString()
    ]);

    console.log(`✅ Campaign "${name}" tracked successfully`);
    return result.id;
  } catch (error) {
    console.error('Error tracking campaign:', error);
    throw new Error('Failed to track campaign');
  }
}

// Get campaign analytics
export async function getCampaignAnalytics(campaignId?: number): Promise<any> {
  try {
    let sql = `
      SELECT 
        c.id,
        c.name,
        c.status,
        c.sentAt,
        c.leadIds,
        COUNT(l.id) as totalLeads,
        COUNT(e.id) as enrichedLeads,
        COUNT(et.id) as emailTemplates
      FROM campaigns c
      LEFT JOIN leads l ON JSON_ARRAY_LENGTH(c.leadIds) > 0
      LEFT JOIN enriched_leads e ON l.id = e.leadId
      LEFT JOIN email_templates et ON c.templateId = et.id
    `;
    
    let params: any[] = [];
    
    if (campaignId) {
      sql += ' WHERE c.id = ?';
      params.push(campaignId);
    }
    
    sql += ' GROUP BY c.id ORDER BY c.sentAt DESC';
    
    const campaigns = await getRows(sql, params);
    
    return {
      campaigns: campaigns.map((campaign: any) => ({
        ...campaign,
        leadIds: JSON.parse(campaign.leadIds || '[]')
      }))
    };
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    return { error: 'Failed to get campaign analytics' };
  }
}

// Data export functionality
export async function exportData(exportType: string, filters: any = {}): Promise<any> {
  try {
    let data;
    
    switch (exportType) {
      case 'icps':
        data = await getRows('SELECT * FROM icps ORDER BY createdAt DESC');
        break;
      case 'leads':
        data = await getRows(`
          SELECT l.*, e.bio, e.interests, e.oneSentenceWhyTheyCare
          FROM leads l
          LEFT JOIN enriched_leads e ON l.id = e.leadId
          ORDER BY l.createdAt DESC
        `);
        break;
      case 'reports':
        data = await getRows('SELECT * FROM sales_intelligence_reports ORDER BY createdAt DESC');
        break;
      case 'campaigns':
        data = await getRows(`
          SELECT c.*, et.subject, et.body
          FROM campaigns c
          LEFT JOIN email_templates et ON c.templateId = et.id
          ORDER BY c.sentAt DESC
        `);
        break;
      default:
        throw new Error('Invalid export type');
    }

    return {
      exportType,
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      data
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

// Database maintenance and optimization
export async function optimizeDatabase(): Promise<any> {
  try {
    console.log('🔧 Starting database optimization...');
    
    // Create indexes for better performance
    await runQuery('CREATE INDEX IF NOT EXISTS idx_leads_icpId ON leads(icpId)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(companyName)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(createdAt)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_reports_priority ON sales_intelligence_reports(priority)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_reports_score ON sales_intelligence_reports(totalScore)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_enriched_leads_leadId ON enriched_leads(leadId)');
    
    // Analyze tables for query optimization
    await runQuery('ANALYZE');
    
    // Vacuum to reclaim space
    await runQuery('VACUUM');
    
    console.log('✅ Database optimization completed');
    
    return {
      success: true,
      message: 'Database optimized successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error optimizing database:', error);
    throw new Error('Failed to optimize database');
  }
}

// Backup and restore functionality
export async function backupDatabase(): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./data/backup-${timestamp}.db`;
    
    // Simple file copy backup (SQLite databases can be safely copied when not in use)
    const fs = require('fs');
    const path = require('path');
    
    // Ensure data directory exists
    const dataDir = path.dirname(backupPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Copy the database file
    fs.copyFileSync(dbPath, backupPath);
    
    console.log(`✅ Database backed up to ${backupPath}`);
    
    return backupPath;
  } catch (error) {
    console.error('Error backing up database:', error);
    throw new Error('Failed to backup database');
  }
} 