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
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const salesIntelligenceAgent_1 = require("../../agents/salesIntelligenceAgent");
const router = express_1.default.Router();
// Generate comprehensive Sales Intelligence Report
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingReport = yield (0, init_1.getSalesIntelligenceReport)(websiteUrl);
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
        const reportData = yield (0, salesIntelligenceAgent_1.generateSalesIntelligenceReport)(websiteUrl);
        // PATCH: Robustly check for missing/malformed LLM results
        if (!reportData || !reportData.companyOverview || !reportData.companyOverview.companyName) {
            console.error('❌ LLM result missing companyName or malformed:', reportData);
            return res.status(500).json({
                success: false,
                error: 'LLM result missing companyName or malformed',
                raw: reportData
            });
        }
        // Save to database
        const reportId = yield (0, init_1.createSalesIntelligenceReport)(reportData.companyOverview.companyName, websiteUrl, reportData);
        // Get the complete report with all related data
        const completeReport = yield (0, init_1.getSalesIntelligenceReport)(websiteUrl);
        console.log(`✅ Sales Intelligence Report generated and saved (ID: ${reportId})`);
        res.json({
            success: true,
            data: completeReport,
            isCached: false,
            message: 'Report generated successfully'
        });
    }
    catch (error) {
        console.error('Error generating sales intelligence report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate sales intelligence report',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get Sales Intelligence Report by URL
router.get('/report/:url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.params;
        const websiteUrl = decodeURIComponent(url);
        const report = yield (0, init_1.getSalesIntelligenceReport)(websiteUrl);
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
    }
    catch (error) {
        console.error('Error retrieving sales intelligence report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve sales intelligence report',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get top Sales Intelligence Reports
router.get('/top', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const reports = yield (0, init_1.getTopSalesIntelligenceReports)(limit);
        res.json({
            success: true,
            data: reports,
            count: reports.length
        });
    }
    catch (error) {
        console.error('Error retrieving top sales intelligence reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve top sales intelligence reports',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Update Apollo.io lead matches for a report
router.post('/apollo-matches', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId, apolloCompanyId, companyName, matchedContacts, icpFitScore, intentScore } = req.body;
        if (!reportId || !apolloCompanyId || !companyName) {
            return res.status(400).json({
                success: false,
                error: 'Report ID, Apollo Company ID, and Company Name are required'
            });
        }
        yield (0, init_1.updateApolloLeadMatches)(reportId, apolloCompanyId, companyName, matchedContacts || [], icpFitScore || 0, intentScore || 0);
        res.json({
            success: true,
            message: 'Apollo lead matches updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating Apollo lead matches:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update Apollo lead matches',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get Sales Intelligence Report analytics
router.get('/analytics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topReports = yield (0, init_1.getTopSalesIntelligenceReports)(20);
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
    }
    catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate analytics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Search Sales Intelligence Reports
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, industry, priority, minScore } = req.query;
        // This would implement search functionality
        // For now, return top reports
        const reports = yield (0, init_1.getTopSalesIntelligenceReports)(50);
        let filteredReports = reports;
        if (query) {
            filteredReports = reports.filter(report => report.companyName.toLowerCase().includes(query.toString().toLowerCase()) ||
                report.domain.toLowerCase().includes(query.toString().toLowerCase()));
        }
        if (industry) {
            filteredReports = filteredReports.filter(report => {
                var _a, _b;
                const reportData = report.reportData;
                return (_b = (_a = reportData === null || reportData === void 0 ? void 0 : reportData.companyOverview) === null || _a === void 0 ? void 0 : _a.industryClassification) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(industry.toString().toLowerCase());
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
    }
    catch (error) {
        console.error('Error searching sales intelligence reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search sales intelligence reports',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Helper functions for analytics
function getTopIndustries(reports) {
    const industryCount = {};
    reports.forEach(report => {
        var _a, _b;
        const industry = (_b = (_a = report.reportData) === null || _a === void 0 ? void 0 : _a.companyOverview) === null || _b === void 0 ? void 0 : _b.industryClassification;
        if (industry) {
            industryCount[industry] = (industryCount[industry] || 0) + 1;
        }
    });
    return Object.entries(industryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([industry]) => industry);
}
function getTopTechnologies(reports) {
    const techCount = {};
    reports.forEach(report => {
        var _a, _b;
        const technologies = (_b = (_a = report.reportData) === null || _a === void 0 ? void 0 : _a.technologyStack) === null || _b === void 0 ? void 0 : _b.integrations;
        if (technologies && Array.isArray(technologies)) {
            technologies.forEach(tech => {
                techCount[tech] = (techCount[tech] || 0) + 1;
            });
        }
    });
    return Object.entries(techCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tech]) => tech);
}
exports.default = router;
