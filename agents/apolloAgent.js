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
exports.apolloToInstantlyLead = apolloToInstantlyLead;
exports.searchApolloContacts = searchApolloContacts;
// agents/apolloAgent.ts
// Apollo Agent: Lead discovery and enrichment
const node_fetch_1 = __importDefault(require("node-fetch"));
const APOLLO_API_KEY = process.env.APOLLO_API_KEY || 'YOUR_APOLLO_API_KEY';
const APOLLO_BASE_URL = 'https://api.apollo.io/v1/mixed_people/search'; // Example endpoint
// Transform Apollo contact to Instantly lead format
function apolloToInstantlyLead(person) {
    var _a, _b, _c;
    return {
        email: person.email,
        firstName: person.first_name,
        lastName: person.last_name,
        jobTitle: person.title,
        companyName: (_a = person.organization) === null || _a === void 0 ? void 0 : _a.name,
        companyWebsite: (_b = person.organization) === null || _b === void 0 ? void 0 : _b.website_url,
        companyIndustry: (_c = person.organization) === null || _c === void 0 ? void 0 : _c.industry,
        // Add more fields as needed
    };
}
// Search Apollo for leads matching the query
function searchApolloContacts(queryParams_1) {
    return __awaiter(this, arguments, void 0, function* (queryParams, limit = 15) {
        const url = `${APOLLO_BASE_URL}`;
        const payload = {
            q_organization_num_employees: queryParams.organization_num_employees || [],
            q_titles: queryParams.title || [],
            q_countries: queryParams.country || [],
            q_industries: queryParams.industry || [],
            page: 1,
            per_page: limit
        };
        const response = yield (0, node_fetch_1.default)(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': APOLLO_API_KEY,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = yield response.text();
            console.error('Apollo API error (search):', errorText);
            throw new Error('Apollo search failed');
        }
        const data = yield response.json();
        return data.people || [];
    });
}
