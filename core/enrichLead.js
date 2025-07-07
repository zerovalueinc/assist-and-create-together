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
exports.enrichLeadFromInstantly = enrichLeadFromInstantly;
const webCrawler_1 = require("../agents/webCrawler");
const phantombuster_1 = require("../agents/phantombuster");
const claude_1 = require("../agents/claude");
function enrichLeadFromInstantly(lead) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Use Instantly's news if available, otherwise enrich
        const latestContext = ((_a = lead.news) === null || _a === void 0 ? void 0 : _a.length)
            ? lead.news
            : yield (0, webCrawler_1.fetchSerperContext)(lead.companyDomain);
        // Always enrich for traffic (Instantly doesn't provide)
        const trafficEstimate = yield (0, claude_1.estimateIdentifiableTraffic)(lead.companyDomain);
        // LinkedIn enrichment (if LinkedIn URL is present)
        const linkedIn = lead.linkedInUrl
            ? yield (0, phantombuster_1.fetchPhantomBusterLinkedIn)(lead.linkedInUrl)
            : {};
        // AI-powered enrichment using OpenRouter/Claude
        const similarCustomer = yield (0, claude_1.findSimilarCustomer)(lead.companyDomain);
        const averageACV = yield (0, claude_1.estimateAverageACV)(lead.companyDomain);
        const primaryKpi = yield (0, claude_1.identifyPrimaryKpi)(lead.jobTitle, lead.companyDomain);
        const demandGenChannel = yield (0, claude_1.identifyDemandGenChannel)(lead.companyDomain);
        const currentStackTool = yield (0, claude_1.identifyCurrentStackTool)([]); // No tech stack from BuiltWith
        return Object.assign(Object.assign({}, lead), { latestContext,
            trafficEstimate,
            linkedIn,
            similarCustomer,
            averageACV,
            primaryKpi,
            demandGenChannel,
            currentStackTool });
    });
}
