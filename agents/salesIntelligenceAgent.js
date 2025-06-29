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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSalesIntelligenceReport = generateSalesIntelligenceReport;
const webCrawler_1 = require("./webCrawler");
const analysisAgent_1 = require("./analysisAgent");
function generateSalesIntelligenceReport(websiteUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔬 Starting comprehensive Sales Intelligence Report for: ${websiteUrl}`);
        try {
            const domain = new URL(websiteUrl).hostname.replace('www.', '');
            // Step 1: Gather comprehensive company data (using Haiku for speed)
            const companyData = yield gatherCompanyData(websiteUrl, domain);
            // Step 2: Analyze market intelligence (using Haiku for speed)
            const marketData = yield analyzeMarketIntelligence(domain);
            // Step 3: Research financial performance (using Haiku for speed)
            const financialData = yield researchFinancialPerformance(domain);
            // Step 4: Analyze technology stack (using Haiku for speed)
            const techData = yield analyzeTechnologyStack(websiteUrl, domain);
            // Step 5: Assess sales & marketing strategy (using Haiku for speed)
            const salesMarketingData = yield assessSalesMarketingStrategy(websiteUrl, domain);
            // Step 6: Evaluate IBP capability maturity (using Haiku for speed)
            const ibpData = yield evaluateIBPCapabilityMaturity(websiteUrl, domain);
            // Step 7: Identify sales opportunity insights (using Haiku for speed)
            const opportunityData = yield identifySalesOpportunityInsights(websiteUrl, domain);
            // Step 8: Compile all data for high-quality analysis
            const allData = {
                companyData,
                marketData,
                financialData,
                techData,
                salesMarketingData,
                ibpData,
                opportunityData,
                websiteUrl,
                domain,
                timestamp: new Date().toISOString()
            };
            // Step 9: Use BEST model for comprehensive analysis
            console.log(`🧠 Using high-quality analysis for sales intelligence report`);
            const analysisResult = yield (0, analysisAgent_1.analyzeWithBestModel)({
                type: 'sales_intelligence',
                data: allData,
                context: 'Comprehensive sales intelligence report generation'
            });
            if (analysisResult.success) {
                console.log(`✅ High-quality sales intelligence report generated using ${analysisResult.model_used} (${analysisResult.cost_estimate})`);
                return analysisResult.data;
            }
            else {
                console.warn('⚠️ High-quality analysis failed, falling back to basic compilation');
                return compileBasicReport(companyData, marketData, financialData, techData, salesMarketingData, ibpData, opportunityData);
            }
        }
        catch (error) {
            console.error('Error generating sales intelligence report:', error);
            throw error;
        }
    });
}
// Fallback basic report compilation
function compileBasicReport(companyData, marketData, financialData, techData, salesMarketingData, ibpData, opportunityData) {
    return {
        companyOverview: companyData,
        marketIntelligence: marketData,
        financialPerformance: financialData,
        technologyStack: techData,
        salesMarketingStrategy: salesMarketingData,
        ibpCapabilityMaturity: ibpData,
        salesOpportunityInsights: opportunityData
    };
}
function gatherCompanyData(websiteUrl, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📊 Gathering company data for: ${domain}`);
        const searches = [
            `${domain} company overview`,
            `${domain} about us`,
            `${domain} leadership team`,
            `${domain} headquarters location`,
            `${domain} founding year`,
            `${domain} employee count`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        // Extract company information from search results
        const companyInfo = {
            companyName: extractCompanyName(domain, searchResults),
            websiteUrl,
            domain,
            headquarters: extractHeadquarters(searchResults),
            foundingYear: extractFoundingYear(searchResults),
            employeeRange: extractEmployeeRange(searchResults),
            industryClassification: extractIndustryClassification(searchResults),
            executiveTeam: extractExecutiveTeam(searchResults)
        };
        return companyInfo;
    });
}
function analyzeMarketIntelligence(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📈 Analyzing market intelligence for: ${domain}`);
        const searches = [
            `${domain} market size`,
            `${domain} total addressable market`,
            `${domain} customer segments`,
            `${domain} competitors`,
            `${domain} market positioning`,
            `${domain} industry trends`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        return {
            totalAddressableMarket: extractTAM(searchResults),
            customerSegments: extractCustomerSegments(searchResults),
            positioningStatement: extractPositioningStatement(searchResults),
            competitiveLandscape: {
                directCompetitors: extractDirectCompetitors(searchResults),
                differentiators: extractDifferentiators(searchResults),
                marketTrends: extractMarketTrends(searchResults)
            }
        };
    });
}
function researchFinancialPerformance(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`💰 Researching financial performance for: ${domain}`);
        const searches = [
            `${domain} revenue`,
            `${domain} funding rounds`,
            `${domain} investors`,
            `${domain} valuation`,
            `${domain} annual recurring revenue`,
            `${domain} business model`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        return {
            estimatedAnnualRevenue: extractRevenue(searchResults),
            fundingRounds: extractFundingRounds(searchResults),
            totalAmountRaised: extractTotalFunding(searchResults),
            keyInvestors: extractKeyInvestors(searchResults),
            fundingStage: extractFundingStage(searchResults),
            revenueModel: extractRevenueModel(searchResults)
        };
    });
}
function analyzeTechnologyStack(websiteUrl, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔧 Analyzing technology stack for: ${domain}`);
        const searches = [
            `${domain} integrations`,
            `${domain} API`,
            `${domain} technology stack`,
            `${domain} product features`,
            `${domain} unique selling propositions`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        return {
            productOfferings: extractProductOfferings(searchResults),
            integrations: extractIntegrations(searchResults),
            techStackComponents: extractTechStackComponents(searchResults),
            uniqueSellingPropositions: extractUSPs(searchResults)
        };
    });
}
function assessSalesMarketingStrategy(websiteUrl, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📊 Assessing sales & marketing strategy for: ${domain}`);
        const searches = [
            `${domain} go to market strategy`,
            `${domain} target audience`,
            `${domain} marketing channels`,
            `${domain} sales process`,
            `${domain} ideal customer profile`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        return {
            goToMarketStrategy: extractGTMStrategy(searchResults),
            targetAudience: {
                icpCharacteristics: {
                    companySize: extractTargetCompanySizes(searchResults),
                    industryVerticals: extractTargetIndustries(searchResults),
                    keyPersonas: extractKeyPersonas(searchResults)
                }
            },
            marketingChannels: extractMarketingChannels(searchResults),
            salesProcess: {
                inboundOutboundRatio: extractInboundOutboundRatio(searchResults),
                salesCycleLength: extractSalesCycleLength(searchResults),
                averageDealSize: extractAverageDealSize(searchResults)
            }
        };
    });
}
function evaluateIBPCapabilityMaturity(websiteUrl, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`📋 Evaluating IBP capability maturity for: ${domain}`);
        const searches = [
            `${domain} sales operations planning`,
            `${domain} data integration`,
            `${domain} analytics capabilities`,
            `${domain} forecasting`,
            `${domain} business intelligence`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        const maturityLevel = assessMaturityLevel(searchResults);
        const maturityScore = calculateMaturityScore(searchResults);
        return {
            ibpProcesses: extractIBPProcesses(searchResults),
            dataIntegration: {
                dataSilos: assessDataSilos(searchResults),
                dataCentralizationPercentage: assessDataCentralization(searchResults),
                realTimeDataAvailability: assessRealTimeData(searchResults)
            },
            analyticsForecasting: {
                useOfAdvancedAnalytics: assessAdvancedAnalytics(searchResults),
                forecastAccuracyPercentage: assessForecastAccuracy(searchResults),
                scenarioPlanningCapabilities: assessScenarioPlanning(searchResults)
            },
            maturityLevel,
            maturityScore
        };
    });
}
function identifySalesOpportunityInsights(websiteUrl, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🎯 Identifying sales opportunity insights for: ${domain}`);
        const searches = [
            `${domain} hiring`,
            `${domain} job openings`,
            `${domain} recent news`,
            `${domain} product launch`,
            `${domain} partnership`,
            `${domain} expansion`
        ];
        const searchResults = yield Promise.all(searches.map(search => (0, webCrawler_1.searchWeb)(search)));
        const buyingSignals = extractBuyingSignals(searchResults);
        const intentData = extractIntentData(searchResults);
        const engagementMetrics = extractEngagementMetrics(searchResults);
        const identifiedPainPoints = extractPainPoints(searchResults);
        const triggerScore = calculateTriggerScore(buyingSignals, intentData, engagementMetrics);
        return {
            buyingSignals,
            intentData,
            engagementMetrics,
            identifiedPainPoints,
            triggerScore
        };
    });
}
// Helper extraction functions
function extractCompanyName(domain, searchResults) {
    // Extract company name from domain and search results
    const domainParts = domain.split('.');
    return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
}
function extractHeadquarters(searchResults) {
    // Extract headquarters from search results
    return "San Francisco, CA"; // Placeholder
}
function extractFoundingYear(searchResults) {
    // Extract founding year from search results
    return 2020; // Placeholder
}
function extractEmployeeRange(searchResults) {
    // Extract employee range from search results
    return "51-200"; // Placeholder
}
function extractIndustryClassification(searchResults) {
    // Extract industry classification from search results
    return "B2B SaaS"; // Placeholder
}
function extractExecutiveTeam(searchResults) {
    // Extract executive team from search results
    return [
        {
            name: "John Doe",
            title: "CEO",
            linkedInUrl: "https://linkedin.com/in/johndoe",
            background: "Former VP at Tech Company"
        }
    ];
}
function extractTAM(searchResults) {
    return "$10B+"; // Placeholder
}
function extractCustomerSegments(searchResults) {
    return ["SMB", "Mid-Market", "Enterprise"]; // Placeholder
}
function extractPositioningStatement(searchResults) {
    return "Leading B2B SaaS platform for business optimization"; // Placeholder
}
function extractDirectCompetitors(searchResults) {
    return ["Competitor A", "Competitor B", "Competitor C"]; // Placeholder
}
function extractDifferentiators(searchResults) {
    return ["AI-powered", "Easy integration", "Superior UX"]; // Placeholder
}
function extractMarketTrends(searchResults) {
    return ["AI adoption", "Cloud migration", "Digital transformation"]; // Placeholder
}
function extractRevenue(searchResults) {
    return "$10M - $50M"; // Placeholder
}
function extractFundingRounds(searchResults) {
    return [
        {
            round: "Series A",
            amount: "$5M",
            date: "2022",
            investors: ["VC Firm A", "VC Firm B"]
        }
    ];
}
function extractTotalFunding(searchResults) {
    return "$15M"; // Placeholder
}
function extractKeyInvestors(searchResults) {
    return ["Sequoia Capital", "Andreessen Horowitz"]; // Placeholder
}
function extractFundingStage(searchResults) {
    return "Series A"; // Placeholder
}
function extractRevenueModel(searchResults) {
    return "Subscription-based"; // Placeholder
}
function extractProductOfferings(searchResults) {
    return ["Core Platform", "Analytics", "API"]; // Placeholder
}
function extractIntegrations(searchResults) {
    return ["Salesforce", "HubSpot", "Slack"]; // Placeholder
}
function extractTechStackComponents(searchResults) {
    return ["React", "Node.js", "PostgreSQL"]; // Placeholder
}
function extractUSPs(searchResults) {
    return ["AI-powered insights", "Real-time analytics", "Easy setup"]; // Placeholder
}
function extractGTMStrategy(searchResults) {
    return "Product-Led Growth"; // Placeholder
}
function extractTargetCompanySizes(searchResults) {
    return ["51-200", "201-1000"]; // Placeholder
}
function extractTargetIndustries(searchResults) {
    return ["Technology", "Professional Services", "Healthcare"]; // Placeholder
}
function extractKeyPersonas(searchResults) {
    return ["VP of Sales", "RevOps Manager", "CTO"]; // Placeholder
}
function extractMarketingChannels(searchResults) {
    return ["Content Marketing", "SEO", "Paid Advertising"]; // Placeholder
}
function extractInboundOutboundRatio(searchResults) {
    return "70/30"; // Placeholder
}
function extractSalesCycleLength(searchResults) {
    return "45 days"; // Placeholder
}
function extractAverageDealSize(searchResults) {
    return "$25K"; // Placeholder
}
function extractIBPProcesses(searchResults) {
    return ["S&OP", "Demand Planning", "Supply Planning"]; // Placeholder
}
function assessDataSilos(searchResults) {
    return "Moderate"; // Placeholder
}
function assessDataCentralization(searchResults) {
    return 75; // Placeholder
}
function assessRealTimeData(searchResults) {
    return true; // Placeholder
}
function assessAdvancedAnalytics(searchResults) {
    return true; // Placeholder
}
function assessForecastAccuracy(searchResults) {
    return 85; // Placeholder
}
function assessScenarioPlanning(searchResults) {
    return false; // Placeholder
}
function assessMaturityLevel(searchResults) {
    return 3; // Placeholder
}
function calculateMaturityScore(searchResults) {
    return 7.5; // Placeholder
}
function extractBuyingSignals(searchResults) {
    return ["Recent hiring", "Product launch", "Partnership announcement"]; // Placeholder
}
function extractIntentData(searchResults) {
    return {
        websiteVisits: 1500,
        contentDownloads: 8,
        keywordSearches: ["solution", "platform", "integration"]
    };
}
function extractEngagementMetrics(searchResults) {
    return {
        emailOpenRate: 28,
        clickThroughRate: 4.2,
        eventAttendance: 2
    };
}
function extractPainPoints(searchResults) {
    return ["Data silos", "Manual processes", "Poor visibility"]; // Placeholder
}
function calculateTriggerScore(buyingSignals, intentData, engagementMetrics) {
    let score = 0;
    // Buying signals (0-4 points)
    score += Math.min(4, buyingSignals.length);
    // Intent data (0-3 points)
    if (intentData.websiteVisits > 1000)
        score += 2;
    if (intentData.contentDownloads > 5)
        score += 1;
    // Engagement metrics (0-3 points)
    if (engagementMetrics.emailOpenRate > 25)
        score += 1;
    if (engagementMetrics.clickThroughRate > 3)
        score += 1;
    if (engagementMetrics.eventAttendance > 0)
        score += 1;
    return Math.min(10, score);
}
