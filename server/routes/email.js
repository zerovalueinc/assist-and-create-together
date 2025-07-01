"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.emailRoutes = void 0;
const express_1 = __importDefault(require("express"));
const init_1 = require("../database/init");
const router = express_1.default.Router();
exports.emailRoutes = router;
// Generate email template for a lead
router.post('/generate/:leadId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leadId } = req.params;
        const { tone = 'professional' } = req.body;
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
        // Get enrichment data if available
        const enrichment = yield (0, init_1.getRow)('SELECT * FROM enriched_leads WHERE leadId = ?', [leadId]);
        // Parse ICP data
        const icpData = Object.assign(Object.assign({}, icp), { painPoints: JSON.parse(icp.painPoints || '[]'), technologies: JSON.parse(icp.technologies || '[]'), companySize: JSON.parse(icp.companySize || '[]'), jobTitles: JSON.parse(icp.jobTitles || '[]'), locationCountry: JSON.parse(icp.locationCountry || '[]'), industries: JSON.parse(icp.industries || '[]') });
        // For now, create mock email template
        // In a real implementation, this would call the email agent
        const emailTemplate = {
            subject: `Quick question about ${icpData.validUseCase} at ${lead.companyName}`,
            body: `Hi ${lead.firstName},

I noticed you're the ${lead.title} at ${lead.companyName}, and I thought you might be interested in how we're helping companies like yours with ${icpData.painPoints[0] || 'business challenges'}.

${enrichment ? enrichment.oneSentenceWhyTheyCare : `As someone in your position, you likely care about ${icpData.painPoints[0] || 'business efficiency'}.`}

Would you be open to a 15-minute call to discuss how we could help ${lead.companyName} achieve better results?

Best regards,
[Your Name]`,
            tone: tone
        };
        // Store email template
        const result = yield (0, init_1.runQuery)(`
      INSERT INTO email_templates (leadId, subject, body, tone)
      VALUES (?, ?, ?, ?)
    `, [
            leadId,
            emailTemplate.subject,
            emailTemplate.body,
            emailTemplate.tone
        ]);
        // Get the created template
        const createdTemplate = yield (0, init_1.getRow)('SELECT * FROM email_templates WHERE id = ?', [result.id]);
        res.json({
            success: true,
            emailTemplate: createdTemplate
        });
    }
    catch (error) {
        console.error('Error generating email template:', error);
        res.status(500).json({
            error: 'Failed to generate email template',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get email templates for a lead
router.get('/:leadId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leadId } = req.params;
        const { getRows } = yield Promise.resolve().then(() => __importStar(require('../database/init')));
        const templates = yield getRows('SELECT * FROM email_templates WHERE leadId = ? ORDER BY createdAt DESC', [leadId]);
        res.json({ success: true, templates });
    }
    catch (error) {
        console.error('Error fetching email templates:', error);
        res.status(500).json({
            error: 'Failed to fetch email templates',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Update email template
router.put('/:templateId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateId } = req.params;
        const { subject, body, tone } = req.body;
        const result = yield (0, init_1.runQuery)(`
      UPDATE email_templates 
      SET subject = ?, body = ?, tone = ?
      WHERE id = ?
    `, [subject, body, tone, templateId]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Email template not found' });
        }
        const updatedTemplate = yield (0, init_1.getRow)('SELECT * FROM email_templates WHERE id = ?', [templateId]);
        res.json({ success: true, emailTemplate: updatedTemplate });
    }
    catch (error) {
        console.error('Error updating email template:', error);
        res.status(500).json({
            error: 'Failed to update email template',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
