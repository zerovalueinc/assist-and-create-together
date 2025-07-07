"use strict";
// agents/researchAgent.ts
// Research Agent: Full Instantly v2 API integration for lead management
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
exports.loadICP = loadICP;
exports.fetchLeads = fetchLeads;
exports.importLeadsBulk = importLeadsBulk;
exports.updateLead = updateLead;
exports.assignLeadsToCampaign = assignLeadsToCampaign;
exports.moveLeadsToList = moveLeadsToList;
exports.fetchLeadLists = fetchLeadLists;
exports.fetchCampaigns = fetchCampaigns;
exports.fetchCampaignLeads = fetchCampaignLeads;
const fs_1 = __importDefault(require("fs"));
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY || 'YOUR_API_KEY_HERE';
const INSTANTLY_API_URL = 'https://api.instantly.ai/api/v2';
// Loads ICP config (for reference, not used for search)
function loadICP(icpPath = './icp.json') {
    return JSON.parse(fs_1.default.readFileSync(icpPath, 'utf-8'));
}
// 1. Fetch/filter existing leads
function fetchLeads() {
    return __awaiter(this, arguments, void 0, function* (params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = yield fetch(`${INSTANTLY_API_URL}/leads?${query}`, {
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Instantly API error (fetch leads):', errorText);
            throw new Error('Instantly fetch leads failed');
        }
        return yield response.json();
    });
}
// 2. Bulk import new leads (with custom fields)
function importLeadsBulk(leads, listName, listId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let createdListId = listId;
        if (listName && !listId) {
            // Create a new lead list with the given name
            const createListResponse = yield fetch(`${INSTANTLY_API_URL}/lead-lists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: listName }),
            });
            if (!createListResponse.ok) {
                const errorText = yield createListResponse.text();
                console.error('Instantly API error (create list):', errorText);
                throw new Error('Instantly lead list creation failed');
            }
            const list = yield createListResponse.json();
            createdListId = list.id || ((_a = list.data) === null || _a === void 0 ? void 0 : _a.id);
        }
        const response = yield fetch(`${INSTANTLY_API_URL}/leads/list`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createdListId ? { leads, list_id: createdListId } : { leads }),
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Instantly API error (import leads):', errorText);
            throw new Error('Instantly import leads failed');
        }
        return yield response.json();
    });
}
// 3. Update/enrich a lead (PATCH by id)
function updateLead(leadId, customFields) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${INSTANTLY_API_URL}/leads/${leadId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customFields }),
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Instantly API error (update lead):', errorText);
            throw new Error('Instantly update lead failed');
        }
        return yield response.json();
    });
}
// 4. Assign leads to a campaign (on creation or via update)
function assignLeadsToCampaign(leadIds, campaignId) {
    return __awaiter(this, void 0, void 0, function* () {
        // This is a placeholder; check Instantly docs for the exact endpoint if needed
        // You may be able to PATCH leads with campaign_id or use a campaign move endpoint
        return Promise.all(leadIds.map(leadId => updateLead(leadId, { campaign_id: campaignId })));
    });
}
// Move leads to another Instantly lead list
function moveLeadsToList(leadIds, listId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Instantly API: PATCH /leads/{id} with new list_id
        return Promise.all(leadIds.map(leadId => updateLead(leadId, { list_id: listId })));
    });
}
// Fetch all Instantly lead lists
function fetchLeadLists() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${INSTANTLY_API_URL}/lead-lists`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Instantly API error (fetch lead lists):', errorText);
            throw new Error('Instantly fetch lead lists failed');
        }
        return yield response.json();
    });
}
// Fetch all Instantly campaigns
function fetchCampaigns() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${INSTANTLY_API_URL}/campaigns`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Instantly API error (fetch campaigns):', errorText);
            throw new Error('Instantly fetch campaigns failed');
        }
        return yield response.json();
    });
}
// Fetch leads from a specific Instantly campaign (correct API v2 taxonomy)
function fetchCampaignLeads(campaignId_1) {
    return __awaiter(this, arguments, void 0, function* (campaignId, limit = 15) {
        const response = yield fetch(`${INSTANTLY_API_URL}/leads/list`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ campaign_id: campaignId, limit }),
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Instantly API error (fetch campaign leads):', errorText);
            throw new Error('Instantly fetch campaign leads failed');
        }
        return yield response.json();
    });
}
