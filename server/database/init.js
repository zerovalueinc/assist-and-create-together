"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
exports.runQuery = runQuery;
exports.getRow = getRow;
exports.getRows = getRows;
exports.getCachedResult = getCachedResult;
exports.saveToCache = saveToCache;
exports.cleanupExpiredCache = cleanupExpiredCache;
exports.getCacheStats = getCacheStats;
exports.bulkCacheCleanup = bulkCacheCleanup;
exports.warmCacheForPopularUrls = warmCacheForPopularUrls;
exports.createSalesIntelligenceReport = createSalesIntelligenceReport;
exports.getSalesIntelligenceReport = getSalesIntelligenceReport;
exports.getTopSalesIntelligenceReports = getTopSalesIntelligenceReports;
exports.updateApolloLeadMatches = updateApolloLeadMatches;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Use CommonJS path resolution
const dbPath = path_1.default.join(__dirname, '../../data/personaops.db');
// Ensure the data directory exists
const dataDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
exports.db = new sqlite3_1.default.Database(dbPath);
function initDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            exports.db.serialize(() => {
                // Create ICPs table
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run(`
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
                exports.db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log('✅ Database tables created successfully');
                        resolve();
                    }
                });
            });
        });
    });
}
// Helper function to run queries with promises
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}
// Helper function to get single row
function getRow(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}
// Helper function to get multiple rows
function getRows(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
// Cache helper functions - OPTIMIZED FOR MAXIMUM EFFICIENCY
function getCachedResult(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, isComprehensive = false) {
        try {
            // Add index for faster lookups
            yield runQuery('CREATE INDEX IF NOT EXISTS idx_cache_url_comprehensive ON cache(url, isComprehensive)');
            yield runQuery('CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expiresAt)');
            const cacheEntry = yield getRow('SELECT * FROM cache WHERE url = ? AND isComprehensive = ? AND expiresAt > datetime("now")', [url, isComprehensive ? 1 : 0]);
            if (cacheEntry) {
                // Update last accessed time for cache analytics
                yield runQuery('UPDATE cache SET lastAccessed = datetime("now") WHERE id = ?', [cacheEntry.id]);
                return {
                    icpData: cacheEntry.icpData ? JSON.parse(cacheEntry.icpData) : null,
                    comprehensiveData: cacheEntry.comprehensiveData ? JSON.parse(cacheEntry.comprehensiveData) : null,
                    icpId: cacheEntry.icpId,
                    isCached: true,
                    cachedAt: cacheEntry.createdAt,
                    expiresAt: cacheEntry.expiresAt
                };
            }
            return null;
        }
        catch (error) {
            console.error('Error getting cached result:', error);
            return null;
        }
    });
}
function saveToCache(url_1, isComprehensive_1, icpData_1) {
    return __awaiter(this, arguments, void 0, function* (url, isComprehensive, icpData, comprehensiveData = null, icpId) {
        try {
            // EXTENDED CACHE DURATION: 30 days for maximum cost savings
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            yield runQuery(`INSERT OR REPLACE INTO cache 
       (url, isComprehensive, icpData, comprehensiveData, icpId, expiresAt, lastAccessed) 
       VALUES (?, ?, ?, ?, ?, ?, datetime("now"))`, [
                url,
                isComprehensive ? 1 : 0,
                JSON.stringify(icpData),
                comprehensiveData ? JSON.stringify(comprehensiveData) : null,
                icpId,
                expiresAt.toISOString()
            ]);
            console.log(`💾 Cached result for ${url} (${isComprehensive ? 'comprehensive' : 'basic'}) - Expires in 30 days`);
        }
        catch (error) {
            console.error('Error saving to cache:', error);
        }
    });
}
function cleanupExpiredCache() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield runQuery('DELETE FROM cache WHERE expiresAt < datetime("now")');
            if (result.changes > 0) {
                console.log(`🧹 Cleaned up ${result.changes} expired cache entries`);
            }
        }
        catch (error) {
            console.error('Error cleaning up cache:', error);
        }
    });
}
// NEW: Cache analytics for monitoring efficiency
function getCacheStats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const totalEntries = yield getRow('SELECT COUNT(*) as count FROM cache');
            const activeEntries = yield getRow('SELECT COUNT(*) as count FROM cache WHERE expiresAt > datetime("now")');
            const expiredEntries = yield getRow('SELECT COUNT(*) as count FROM cache WHERE expiresAt <= datetime("now")');
            const mostAccessed = yield getRows(`
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
        }
        catch (error) {
            console.error('Error getting cache stats:', error);
            return null;
        }
    });
}
// NEW: Bulk cache operations for efficiency
function bulkCacheCleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Clean up expired entries
            yield cleanupExpiredCache();
            // Optimize database
            yield runQuery('VACUUM');
            yield runQuery('ANALYZE');
            console.log('🔧 Database optimized for maximum performance');
        }
        catch (error) {
            console.error('Error in bulk cache cleanup:', error);
        }
    });
}
// NEW: Cache warming for popular URLs
function warmCacheForPopularUrls() {
    return __awaiter(this, void 0, void 0, function* () {
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
                const existing = yield getCachedResult(url, true);
                if (!existing) {
                    console.log(`🔥 Warming cache for: ${url}`);
                    // This would trigger the comprehensive IBP generation
                    // For now, just log the intent
                }
            }
            console.log('✅ Cache warming completed');
        }
        catch (error) {
            console.error('Error warming cache:', error);
        }
    });
}
// Sales Intelligence Report Helper Functions
function createSalesIntelligenceReport(companyName, websiteUrl, reportData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const domain = new URL(websiteUrl).hostname.replace('www.', '');
            // Calculate scores
            const icpFitScore = calculateICPFitScore(reportData);
            const ibpMaturityScore = calculateIBPMaturityScore(reportData);
            const salesTriggerScore = calculateSalesTriggerScore(reportData);
            const totalScore = (icpFitScore * 0.4) + (ibpMaturityScore * 0.3) + (salesTriggerScore * 0.3);
            // Determine priority
            const priority = totalScore >= 8 ? 'high' : totalScore >= 6 ? 'medium' : 'low';
            const result = yield runQuery(`INSERT INTO sales_intelligence_reports 
       (companyName, websiteUrl, domain, reportData, icpFitScore, ibpMaturityScore, salesTriggerScore, totalScore, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [companyName, websiteUrl, domain, JSON.stringify(reportData), icpFitScore, ibpMaturityScore, salesTriggerScore, totalScore, priority]);
            const reportId = result.id;
            // Insert detailed data into related tables
            yield insertCompanyOverview(reportId, reportData.companyOverview);
            yield insertMarketIntelligence(reportId, reportData.marketIntelligence);
            yield insertFinancialPerformance(reportId, reportData.financialPerformance);
            yield insertTechnologyStack(reportId, reportData.technologyStack);
            yield insertSalesMarketingStrategy(reportId, reportData.salesMarketingStrategy);
            yield insertIBPCapabilityMaturity(reportId, reportData.ibpCapabilityMaturity);
            yield insertSalesOpportunityInsights(reportId, reportData.salesOpportunityInsights);
            console.log(`💾 Created Sales Intelligence Report for ${companyName} (ID: ${reportId})`);
            return reportId;
        }
        catch (error) {
            console.error('Error creating sales intelligence report:', error);
            throw error;
        }
    });
}
function getSalesIntelligenceReport(websiteUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const report = yield getRow('SELECT * FROM sales_intelligence_reports WHERE websiteUrl = ?', [websiteUrl]);
            if (!report)
                return null;
            // Get related data
            const companyOverview = yield getRow('SELECT * FROM company_overview WHERE reportId = ?', [report.id]);
            const marketIntelligence = yield getRow('SELECT * FROM market_intelligence WHERE reportId = ?', [report.id]);
            const financialPerformance = yield getRow('SELECT * FROM financial_performance WHERE reportId = ?', [report.id]);
            const technologyStack = yield getRow('SELECT * FROM technology_stack WHERE reportId = ?', [report.id]);
            const salesMarketingStrategy = yield getRow('SELECT * FROM sales_marketing_strategy WHERE reportId = ?', [report.id]);
            const ibpCapabilityMaturity = yield getRow('SELECT * FROM ibp_capability_maturity WHERE reportId = ?', [report.id]);
            const salesOpportunityInsights = yield getRow('SELECT * FROM sales_opportunity_insights WHERE reportId = ?', [report.id]);
            const apolloLeadMatches = yield getRows('SELECT * FROM apollo_lead_matches WHERE reportId = ?', [report.id]);
            return Object.assign(Object.assign({}, report), { reportData: JSON.parse(report.reportData), companyOverview,
                marketIntelligence,
                financialPerformance,
                technologyStack,
                salesMarketingStrategy,
                ibpCapabilityMaturity,
                salesOpportunityInsights,
                apolloLeadMatches });
        }
        catch (error) {
            console.error('Error getting sales intelligence report:', error);
            return null;
        }
    });
}
function getTopSalesIntelligenceReports() {
    return __awaiter(this, arguments, void 0, function* (limit = 10) {
        try {
            const reports = yield getRows('SELECT * FROM sales_intelligence_reports WHERE status = "active" ORDER BY totalScore DESC LIMIT ?', [limit]);
            return reports.map(report => (Object.assign(Object.assign({}, report), { reportData: JSON.parse(report.reportData) })));
        }
        catch (error) {
            console.error('Error getting top sales intelligence reports:', error);
            return [];
        }
    });
}
function updateApolloLeadMatches(reportId, apolloCompanyId, companyName, matchedContacts, icpFitScore, intentScore) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const priority = (icpFitScore + intentScore) / 2 >= 8 ? 'high' : (icpFitScore + intentScore) / 2 >= 6 ? 'medium' : 'low';
            yield runQuery(`INSERT OR REPLACE INTO apollo_lead_matches 
       (reportId, apolloCompanyId, companyName, matchedContacts, icpFitScore, intentScore, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [reportId, apolloCompanyId, companyName, JSON.stringify(matchedContacts), icpFitScore, intentScore, priority]);
            console.log(`🔗 Updated Apollo lead matches for ${companyName}`);
        }
        catch (error) {
            console.error('Error updating Apollo lead matches:', error);
        }
    });
}
// Scoring Functions
function calculateICPFitScore(data) {
    var _a, _b, _c, _d, _e, _f;
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
    if ((_a = data.marketIntelligence) === null || _a === void 0 ? void 0 : _a.industryClassification) {
        score += weights.industryAlignment * 8;
    }
    // Company Size (0-10)
    if ((_b = data.companyOverview) === null || _b === void 0 ? void 0 : _b.employeeRange) {
        const size = data.companyOverview.employeeRange;
        if (size.includes('51-200') || size.includes('201-1000')) {
            score += weights.companySize * 9;
        }
        else if (size.includes('11-50') || size.includes('1001-5000')) {
            score += weights.companySize * 7;
        }
        else {
            score += weights.companySize * 5;
        }
    }
    // Technology Stack Compatibility (0-10)
    if ((_c = data.technologyStack) === null || _c === void 0 ? void 0 : _c.integrations) {
        const integrations = JSON.parse(data.technologyStack.integrations || '[]');
        if (integrations.length >= 3) {
            score += weights.technologyStackCompatibility * 8;
        }
        else if (integrations.length >= 1) {
            score += weights.technologyStackCompatibility * 6;
        }
    }
    // IBP Maturity Level (0-10)
    if ((_d = data.ibpCapabilityMaturity) === null || _d === void 0 ? void 0 : _d.maturityScore) {
        score += weights.ibpMaturityLevel * data.ibpCapabilityMaturity.maturityScore;
    }
    // Identified Pain Points (0-10)
    if ((_e = data.salesOpportunityInsights) === null || _e === void 0 ? void 0 : _e.identifiedPainPoints) {
        const painPoints = JSON.parse(data.salesOpportunityInsights.identifiedPainPoints || '[]');
        score += weights.identifiedPainPoints * Math.min(10, painPoints.length * 2);
    }
    // Engagement Level (0-10)
    if ((_f = data.salesOpportunityInsights) === null || _f === void 0 ? void 0 : _f.engagementMetrics) {
        score += weights.engagementLevel * 7; // Default moderate engagement
    }
    return Math.min(10, Math.max(0, score));
}
function calculateIBPMaturityScore(data) {
    var _a, _b, _c;
    let score = 0;
    // IBP Processes (0-4 points)
    if ((_a = data.ibpCapabilityMaturity) === null || _a === void 0 ? void 0 : _a.ibpProcesses) {
        const processes = JSON.parse(data.ibpCapabilityMaturity.ibpProcesses || '[]');
        score += Math.min(4, processes.length);
    }
    // Data Integration (0-3 points)
    if ((_b = data.ibpCapabilityMaturity) === null || _b === void 0 ? void 0 : _b.dataIntegration) {
        const integration = JSON.parse(data.ibpCapabilityMaturity.dataIntegration || '{}');
        if (integration.dataCentralizationPercentage > 80) {
            score += 3;
        }
        else if (integration.dataCentralizationPercentage > 50) {
            score += 2;
        }
        else {
            score += 1;
        }
    }
    // Analytics & Forecasting (0-3 points)
    if ((_c = data.ibpCapabilityMaturity) === null || _c === void 0 ? void 0 : _c.analyticsForecasting) {
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
function calculateSalesTriggerScore(data) {
    var _a, _b, _c;
    let score = 0;
    // Buying Signals (0-4 points)
    if ((_a = data.salesOpportunityInsights) === null || _a === void 0 ? void 0 : _a.buyingSignals) {
        const signals = JSON.parse(data.salesOpportunityInsights.buyingSignals || '[]');
        score += Math.min(4, signals.length);
    }
    // Intent Data (0-3 points)
    if ((_b = data.salesOpportunityInsights) === null || _b === void 0 ? void 0 : _b.intentData) {
        const intent = JSON.parse(data.salesOpportunityInsights.intentData || '{}');
        if (intent.websiteVisits > 1000) {
            score += 2;
        }
        else if (intent.websiteVisits > 100) {
            score += 1;
        }
        if (intent.contentDownloads > 5) {
            score += 1;
        }
    }
    // Engagement Metrics (0-3 points)
    if ((_c = data.salesOpportunityInsights) === null || _c === void 0 ? void 0 : _c.engagementMetrics) {
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
function insertCompanyOverview(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO company_overview 
     (reportId, companyName, websiteUrl, domain, headquarters, foundingYear, employeeRange, industryClassification, executiveTeam) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            reportId,
            data.companyName,
            data.websiteUrl,
            data.domain,
            data.headquarters,
            data.foundingYear,
            data.employeeRange,
            data.industryClassification,
            JSON.stringify(data.executiveTeam || [])
        ]);
    });
}
function insertMarketIntelligence(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO market_intelligence 
     (reportId, totalAddressableMarket, customerSegments, positioningStatement, competitiveLandscape, marketTrends) 
     VALUES (?, ?, ?, ?, ?, ?)`, [
            reportId,
            data.totalAddressableMarket,
            JSON.stringify(data.customerSegments || []),
            data.positioningStatement,
            JSON.stringify(data.competitiveLandscape || {}),
            JSON.stringify(data.marketTrends || [])
        ]);
    });
}
function insertFinancialPerformance(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO financial_performance 
     (reportId, estimatedAnnualRevenue, fundingRounds, totalAmountRaised, keyInvestors, fundingStage, revenueModel) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            reportId,
            data.estimatedAnnualRevenue,
            JSON.stringify(data.fundingRounds || []),
            data.totalAmountRaised,
            JSON.stringify(data.keyInvestors || []),
            data.fundingStage,
            data.revenueModel
        ]);
    });
}
function insertTechnologyStack(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO technology_stack 
     (reportId, productOfferings, integrations, techStackComponents, uniqueSellingPropositions) 
     VALUES (?, ?, ?, ?, ?)`, [
            reportId,
            JSON.stringify(data.productOfferings || []),
            JSON.stringify(data.integrations || []),
            JSON.stringify(data.techStackComponents || []),
            JSON.stringify(data.uniqueSellingPropositions || [])
        ]);
    });
}
function insertSalesMarketingStrategy(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO sales_marketing_strategy 
     (reportId, goToMarketStrategy, targetAudience, marketingChannels, salesProcess, icpCharacteristics) 
     VALUES (?, ?, ?, ?, ?, ?)`, [
            reportId,
            data.goToMarketStrategy,
            JSON.stringify(data.targetAudience || {}),
            JSON.stringify(data.marketingChannels || []),
            JSON.stringify(data.salesProcess || {}),
            JSON.stringify(data.icpCharacteristics || {})
        ]);
    });
}
function insertIBPCapabilityMaturity(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO ibp_capability_maturity 
     (reportId, ibpProcesses, dataIntegration, analyticsForecasting, maturityLevel, maturityScore) 
     VALUES (?, ?, ?, ?, ?, ?)`, [
            reportId,
            JSON.stringify(data.ibpProcesses || []),
            JSON.stringify(data.dataIntegration || {}),
            JSON.stringify(data.analyticsForecasting || {}),
            data.maturityLevel || 1,
            data.maturityScore || 0
        ]);
    });
}
function insertSalesOpportunityInsights(reportId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data)
            return;
        yield runQuery(`INSERT INTO sales_opportunity_insights 
     (reportId, buyingSignals, intentData, engagementMetrics, identifiedPainPoints, triggerScore) 
     VALUES (?, ?, ?, ?, ?, ?)`, [
            reportId,
            JSON.stringify(data.buyingSignals || []),
            JSON.stringify(data.intentData || {}),
            JSON.stringify(data.engagementMetrics || {}),
            JSON.stringify(data.identifiedPainPoints || []),
            data.triggerScore || 0
        ]);
    });
}
