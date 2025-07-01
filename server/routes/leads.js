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
exports.leadsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const apolloAgent_1 = require("../../agents/apolloAgent");
const router = express_1.default.Router();
exports.leadsRoutes = router;
// Search leads using ICP
router.post('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { icpId, limit = 15 } = req.body;
        if (!icpId) {
            return res.status(400).json({ error: 'ICP ID is required' });
        }
        // Get ICP from database
        const icp = yield (0, init_1.getRow)('SELECT * FROM icps WHERE id = ?', [icpId]);
        if (!icp) {
            return res.status(404).json({ error: 'ICP not found' });
        }
        // Parse ICP data
        const icpData = Object.assign(Object.assign({}, icp), { painPoints: JSON.parse(icp.painPoints || '[]'), technologies: JSON.parse(icp.technologies || '[]'), companySize: JSON.parse(icp.companySize || '[]'), jobTitles: JSON.parse(icp.jobTitles || '[]'), locationCountry: JSON.parse(icp.locationCountry || '[]'), industries: JSON.parse(icp.industries || '[]') });
        // Prepare Apollo query parameters
        const queryParams = {
            organization_num_employees: icpData.companySize || [],
            title: icpData.jobTitles || [],
            country: icpData.locationCountry || [],
            industry: icpData.industries || [],
        };
        // Search Apollo for leads
        const apolloLeads = yield (0, apolloAgent_1.searchApolloContacts)(queryParams, limit);
        if (apolloLeads.length === 0) {
            return res.json({
                success: true,
                leads: [],
                message: 'No leads found matching ICP criteria'
            });
        }
        // Map Apollo leads to our format and store in database
        const storedLeads = [];
        for (const apolloLead of apolloLeads) {
            const mappedLead = (0, apolloAgent_1.apolloToInstantlyLead)(apolloLead);
            // Store lead in database
            const result = yield (0, init_1.runQuery)(`
        INSERT INTO leads (firstName, lastName, fullName, title, email, linkedInUrl, companyName, companyWebsite, confidenceScore, icpId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                mappedLead.firstName,
                mappedLead.lastName,
                mappedLead.firstName + ' ' + mappedLead.lastName,
                mappedLead.jobTitle,
                mappedLead.email,
                apolloLead.linkedin_url || null,
                mappedLead.companyName,
                mappedLead.companyWebsite,
                apolloLead.confidence_score || 0.5,
                icpId
            ]);
            // Get the stored lead
            const storedLead = yield (0, init_1.getRow)('SELECT * FROM leads WHERE id = ?', [result.id]);
            storedLeads.push(storedLead);
        }
        res.json({
            success: true,
            leads: storedLeads,
            count: storedLeads.length
        });
    }
    catch (error) {
        console.error('Error searching leads:', error);
        res.status(500).json({
            error: 'Failed to search leads',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get all leads
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { icpId } = req.query;
        let sql = 'SELECT * FROM leads ORDER BY createdAt DESC';
        let params = [];
        if (icpId) {
            sql = 'SELECT * FROM leads WHERE icpId = ? ORDER BY createdAt DESC';
            params = [icpId];
        }
        const leads = yield (0, init_1.getRows)(sql, params);
        res.json({ success: true, leads });
    }
    catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            error: 'Failed to fetch leads',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get specific lead by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const lead = yield (0, init_1.getRow)('SELECT * FROM leads WHERE id = ?', [id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json({ success: true, lead });
    }
    catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({
            error: 'Failed to fetch lead',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Delete lead
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield (0, init_1.runQuery)('DELETE FROM leads WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json({ success: true, message: 'Lead deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({
            error: 'Failed to delete lead',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
