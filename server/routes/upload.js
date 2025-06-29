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
exports.uploadRoutes = void 0;
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const researchAgent_1 = require("../../agents/researchAgent");
const router = express_1.default.Router();
exports.uploadRoutes = router;
// Upload leads to Instantly
router.post('/instantly', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { icpId, listName } = req.body;
        if (!icpId) {
            return res.status(400).json({ error: 'ICP ID is required' });
        }
        // Get all leads for this ICP
        const leads = yield (0, init_1.getRows)('SELECT * FROM leads WHERE icpId = ?', [icpId]);
        if (leads.length === 0) {
            return res.status(400).json({ error: 'No leads found for this ICP' });
        }
        // Get enrichment data for leads
        const enrichedLeads = [];
        for (const lead of leads) {
            const enrichment = yield (0, init_1.getRow)('SELECT * FROM enriched_leads WHERE leadId = ?', [lead.id]);
            enrichedLeads.push(Object.assign(Object.assign({}, lead), { enrichment: enrichment ? Object.assign(Object.assign({}, enrichment), { interests: JSON.parse(enrichment.interests || '[]') }) : null }));
        }
        // Format leads for Instantly
        const instantlyLeads = enrichedLeads.map(lead => (Object.assign({ email: lead.email, firstName: lead.firstName, lastName: lead.lastName, jobTitle: lead.title, companyName: lead.companyName, companyWebsite: lead.companyWebsite, linkedInUrl: lead.linkedInUrl }, (lead.enrichment && {
            bio: lead.enrichment.bio,
            interests: lead.enrichment.interests.join(', '),
            whyTheyCare: lead.enrichment.oneSentenceWhyTheyCare
        }))));
        // Upload to Instantly
        const uploadResult = yield (0, researchAgent_1.importLeadsBulk)(instantlyLeads, listName);
        res.json({
            success: true,
            message: `Successfully uploaded ${instantlyLeads.length} leads to Instantly`,
            uploadResult,
            leadsCount: instantlyLeads.length
        });
    }
    catch (error) {
        console.error('Error uploading leads to Instantly:', error);
        res.status(500).json({
            error: 'Failed to upload leads to Instantly',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get upload status
router.get('/status/:icpId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { icpId } = req.params;
        // Get leads count for this ICP
        const leads = yield (0, init_1.getRows)('SELECT * FROM leads WHERE icpId = ?', [icpId]);
        const enrichedLeads = yield (0, init_1.getRows)(`
      SELECT COUNT(*) as count 
      FROM enriched_leads el 
      JOIN leads l ON el.leadId = l.id 
      WHERE l.icpId = ?
    `, [icpId]);
        const emailTemplates = yield (0, init_1.getRows)(`
      SELECT COUNT(*) as count 
      FROM email_templates et 
      JOIN leads l ON et.leadId = l.id 
      WHERE l.icpId = ?
    `, [icpId]);
        res.json({
            success: true,
            status: {
                totalLeads: leads.length,
                enrichedLeads: ((_a = enrichedLeads[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                emailTemplates: ((_b = emailTemplates[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                readyForUpload: leads.length > 0
            }
        });
    }
    catch (error) {
        console.error('Error getting upload status:', error);
        res.status(500).json({
            error: 'Failed to get upload status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
