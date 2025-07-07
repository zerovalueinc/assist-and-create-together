"use strict";
// agents/emailAgent.ts
// Email Agent: Fetches leads from Instantly, generates syntax fields using Openrouter LLM, and updates Instantly list
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
exports.enrichLeadsWithSyntax = enrichLeadsWithSyntax;
const fs_1 = __importDefault(require("fs"));
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY || 'YOUR_API_KEY_HERE';
const INSTANTLY_API_URL = 'https://api.instantly.ai/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_KEY_HERE';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
function getIcpContext(icpPath = './icp.json') {
    return JSON.parse(fs_1.default.readFileSync(icpPath, 'utf-8'));
}
function enrichLeadsWithSyntax(listId_1) {
    return __awaiter(this, arguments, void 0, function* (listId, icpPath = './icp.json') {
        const icp = getIcpContext(icpPath);
        // 1. Fetch leads from Instantly list
        const leadsResponse = yield fetch(`${INSTANTLY_API_URL}/lists/${listId}/leads`, {
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!leadsResponse.ok)
            throw new Error('Failed to fetch leads from Instantly');
        const leads = yield leadsResponse.json();
        // 2. For each lead, generate syntax fields using Openrouter LLM
        const enrichedLeads = yield Promise.all((leads.data || leads).map((lead) => __awaiter(this, void 0, void 0, function* () {
            const prompt = `You are a B2B lead enrichment agent for Midbound.ai.\n\nHere is the ICP and context for the product and campaign:\n${JSON.stringify(icp, null, 2)}\n\nHere is the lead data:\n${JSON.stringify(lead, null, 2)}\n\nGenerate all required Instantly syntax fields for this lead, using the ICP and context above. Respond in JSON format with the following fields:\n${Object.keys(icp.instantlySyntax.prospectFields).join(', ')}\n${Object.keys(icp.instantlySyntax.personalizationFields).join(', ')}\n${Object.keys(icp.instantlySyntax.performanceDataFields).join(', ')}\n${Object.keys(icp.instantlySyntax.senderFields).join(', ')}\n`;
            const llmResponse = yield fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4', // or your preferred model
                    messages: [{ role: 'user', content: prompt }],
                }),
            });
            if (!llmResponse.ok)
                throw new Error('Openrouter LLM failed');
            const llmData = yield llmResponse.json();
            let syntaxFields = {};
            try {
                syntaxFields = JSON.parse(llmData.choices[0].message.content);
            }
            catch (e) {
                syntaxFields = { error: 'Failed to parse LLM response' };
            }
            return Object.assign(Object.assign({}, lead), syntaxFields);
        })));
        // 3. Update Instantly list with enriched leads (if API supports bulk update)
        // If not, you may need to create a new list or update leads one by one
        // Placeholder for update logic:
        // await fetch(`${INSTANTLY_API_URL}/lists/${listId}/leads`, { ... })
        return enrichedLeads;
    });
}
