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
exports.enrichLead = enrichLead;
exports.generateSyntaxFields = generateSyntaxFields;
exports.formatRowForSheet = formatRowForSheet;
exports.processExecutiveLead = processExecutiveLead;
exports.processLead = processLead;
const phantombuster_1 = require("../agents/phantombuster");
const webCrawler_1 = require("../agents/webCrawler");
const claude_1 = require("../agents/claude");
const sheets_1 = require("../utils/sheets");
const enrichLead_1 = require("./enrichLead");
function enrichLead(lead) {
    return __awaiter(this, void 0, void 0, function* () {
        const linkedIn = yield (0, phantombuster_1.fetchPhantomBusterLinkedIn)(lead.linkedInUrl);
        const latestContext = yield (0, webCrawler_1.fetchSerperContext)(lead.companyDomain);
        // TODO: Implement these enrichment functions:
        const trafficEstimate = yield (0, claude_1.estimateIdentifiableTraffic)(lead.companyDomain); // e.g., SimilarWeb, math, or Claude
        const targetPageType = yield (0, claude_1.identifyImportantPageTypes)(lead.companyDomain); // e.g., scrape nav, Claude, or rules
        const similarCustomer = yield (0, claude_1.findSimilarCustomer)(lead.companyDomain); // e.g., static list, Claude, or DB
        const averageACV = yield (0, claude_1.estimateAverageACV)(lead.companyDomain); // e.g., industry DB, Claude, or static
        const primaryKpi = yield (0, claude_1.identifyPrimaryKpi)(lead.jobTitle, lead.companyDomain); // e.g., Claude or rules
        const demandGenChannel = yield (0, claude_1.identifyDemandGenChannel)(lead.companyDomain); // e.g., Claude or rules
        const currentStackTool = yield (0, claude_1.identifyCurrentStackTool)([]); // e.g., from techStack (empty for now)
        return Object.assign(Object.assign({}, lead), { linkedIn,
            latestContext,
            trafficEstimate,
            targetPageType,
            similarCustomer,
            averageACV,
            primaryKpi,
            demandGenChannel,
            currentStackTool });
    });
}
function generateSyntaxFields(enriched) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `
You're building syntax variables for a hyper-personalized email campaign targeting Tier 1 execs.

Given:
- Name: ${enriched.firstName} ${enriched.lastName}
- Job Title: ${enriched.jobTitle}
- LinkedIn Summary: ${enriched.linkedIn.headline}, ${enriched.linkedIn.bio}
- Company Name: ${enriched.companyName}
- Recent News/Context: ${JSON.stringify(enriched.latestContext)}

Generate 25+ personalized syntax fields (for use like {{personalizationHook}}, {{demandGenChannel}}, etc.).

Respond in JSON format like:
{
  "personalizationHook": "...",
  "demandGenChannel": "...",
  // ...
}
`;
        const response = yield (0, claude_1.callClaude3)(prompt);
        return JSON.parse(response);
    });
}
function formatRowForSheet(lead, syntax) {
    return Object.assign(Object.assign({}, lead), syntax);
}
function processExecutiveLead(lead) {
    return __awaiter(this, void 0, void 0, function* () {
        const enriched = yield enrichLead(lead);
        const syntax = yield generateSyntaxFields(enriched);
        const sheetRow = formatRowForSheet(lead, syntax);
        yield (0, sheets_1.appendToGoogleSheet)('YourSheetIDHere', sheetRow);
    });
}
function processLead(lead) {
    return __awaiter(this, void 0, void 0, function* () {
        const enriched = yield (0, enrichLead_1.enrichLeadFromInstantly)(lead);
        const syntax = yield generateSyntaxFields(enriched);
        return Object.assign(Object.assign({}, lead), syntax);
    });
}
