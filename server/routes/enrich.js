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
exports.enrichRoutes = void 0;
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const router = express_1.default.Router();
exports.enrichRoutes = router;
// Enrich a specific lead
router.post('/:leadId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leadId } = req.params;
        // Get the lead
        const lead = yield (0, init_1.getRow)('SELECT * FROM leads WHERE id = ?', [leadId]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        // Get the ICP for context
        const icp = yield (0, init_1.getRow)('SELECT * FROM icps WHERE id = ?', [lead.icpId]);
        if (!icp) {
            return res.status(404).json({ error: 'ICP not found' });
        }
        // Parse ICP data
        const icpData = Object.assign(Object.assign({}, icp), { painPoints: JSON.parse(icp.painPoints || '[]'), technologies: JSON.parse(icp.technologies || '[]'), companySize: JSON.parse(icp.companySize || '[]'), jobTitles: JSON.parse(icp.jobTitles || '[]'), locationCountry: JSON.parse(icp.locationCountry || '[]'), industries: JSON.parse(icp.industries || '[]') });
        // For now, create mock enrichment data
        // In a real implementation, this would call the research agent
        const enrichmentData = {
            bio: `Experienced ${lead.title} at ${lead.companyName} with expertise in ${icpData.technologies.join(', ')}`,
            interests: ['Technology', 'Innovation', 'Business Growth'],
            oneSentenceWhyTheyCare: `As a ${lead.title}, they likely care about ${icpData.painPoints[0] || 'business efficiency'}`
        };
        // Store enrichment data
        const result = yield (0, init_1.runQuery)(`
      INSERT INTO enriched_leads (leadId, bio, interests, oneSentenceWhyTheyCare)
      VALUES (?, ?, ?, ?)
    `, [
            leadId,
            enrichmentData.bio,
            JSON.stringify(enrichmentData.interests),
            enrichmentData.oneSentenceWhyTheyCare
        ]);
        // Get the enriched lead
        const enrichedLead = yield (0, init_1.getRow)('SELECT * FROM enriched_leads WHERE id = ?', [result.id]);
        res.json({
            success: true,
            enrichedLead: Object.assign(Object.assign({}, enrichedLead), { interests: JSON.parse(enrichedLead.interests || '[]') })
        });
    }
    catch (error) {
        console.error('Error enriching lead:', error);
        res.status(500).json({
            error: 'Failed to enrich lead',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get enrichment for a lead
router.get('/:leadId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leadId } = req.params;
        const enrichedLead = yield (0, init_1.getRow)('SELECT * FROM enriched_leads WHERE leadId = ?', [leadId]);
        if (!enrichedLead) {
            return res.status(404).json({ error: 'Enrichment not found' });
        }
        res.json({
            success: true,
            enrichedLead: Object.assign(Object.assign({}, enrichedLead), { interests: JSON.parse(enrichedLead.interests || '[]') })
        });
    }
    catch (error) {
        console.error('Error fetching enrichment:', error);
        res.status(500).json({
            error: 'Failed to fetch enrichment',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
