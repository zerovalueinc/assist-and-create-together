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
exports.runCompanyToContactWorkflow = runCompanyToContactWorkflow;
const fs_1 = __importDefault(require("fs"));
const apolloAgent_1 = require("../agents/apolloAgent");
// Load ICP from icp.json
function loadICP(icpPath = './icp.json') {
    return JSON.parse(fs_1.default.readFileSync(icpPath, 'utf-8'));
}
// Example enrichment/processing function (replace with your own logic)
function enrichInstantlyLead(lead) {
    // Add enrichment, LLM, or variable generation here
    return Object.assign(Object.assign({}, lead), { enriched: true // Example field
     });
}
function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
// Filter leads by ICP
function leadMatchesICP(lead, icp) {
    // Region/country
    if (icp.location_country && icp.location_country.length > 0) {
        const country = (lead.country || lead.location_country || '').toLowerCase();
        if (!icp.location_country.some((c) => country.includes(c.toLowerCase())))
            return false;
    }
    // Company size
    if (icp.company_size && icp.company_size.length > 0) {
        const size = (lead.companySize || lead.company_size || '').toString();
        if (!icp.company_size.some((s) => size.includes(s)))
            return false;
    }
    // Industry
    if (icp.industries && icp.industries.length > 0) {
        const industry = (lead.companyIndustry || lead.industry || '').toLowerCase();
        if (!icp.industries.some((i) => industry.includes(i.toLowerCase())))
            return false;
    }
    // Job title (VP/Director only)
    if (icp.job_titles && icp.job_titles.length > 0) {
        const jobTitle = (lead.jobTitle || lead.title || '').toLowerCase();
        if (!icp.job_titles.some((t) => jobTitle.includes(t.toLowerCase())))
            return false;
        if (!/vp|director/.test(jobTitle))
            return false;
        if (/manager|associate|intern|assistant/.test(jobTitle))
            return false;
    }
    return true;
}
// Less strict ICP filter with fallback field names
function leadMatchesICPLoose(lead, icp) {
    // Fallbacks for job title
    const jobTitle = (lead.jobTitle || lead.title || '').toLowerCase();
    // Only require VP or Director in job title
    if (!/vp|director/.test(jobTitle))
        return false;
    if (/manager|associate|intern|assistant/.test(jobTitle))
        return false;
    // Fallbacks for industry
    const industry = (lead.companyIndustry || lead.industry || '').toLowerCase();
    // Fallbacks for country/location
    const country = (lead.country || lead.location_country || lead.location || '').toLowerCase();
    // Only require at least one match for industry or country
    const industryMatch = icp.industries && icp.industries.some((i) => industry.includes(i.toLowerCase()));
    const countryMatch = icp.location_country && icp.location_country.some((c) => country.includes(c.toLowerCase()));
    return industryMatch || countryMatch;
}
// Relaxed ICP filter: only require VP or Director in job title
function leadMatchesJobTitleOnly(lead) {
    const jobTitle = (lead.jobTitle || lead.title || '').toLowerCase();
    return /vp|director/.test(jobTitle) && !/manager|associate|intern|assistant/.test(jobTitle);
}
// Placeholder enrichment for missing fields (industry, country)
function enrichLeadFields(lead) {
    return __awaiter(this, void 0, void 0, function* () {
        // If industry or country is missing, try to enrich using company domain (stub)
        if (!lead.industry && lead.company_domain) {
            // Example: use a lookup or external API here
            // For now, just set a placeholder
            lead.industry = 'unknown';
        }
        if (!lead.country && lead.company_domain) {
            // Example: use a lookup or external API here
            // For now, just set a placeholder
            lead.country = 'unknown';
        }
        return lead;
    });
}
// Map all fields from campaign leads to the import payload, using snake_case keys where possible
function toSnakeCase(obj) {
    const out = {};
    for (const key in obj) {
        if (!obj.hasOwnProperty(key))
            continue;
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        out[snakeKey] = obj[key];
    }
    return out;
}
function runCompanyToContactWorkflow() {
    return __awaiter(this, arguments, void 0, function* (limit = 100) {
        // 1. Load ICP for Apollo query
        const icp = loadICP();
        const queryParams = {
            organization_num_employees: icp.company_size || [],
            title: icp.job_titles || [],
            country: icp.location_country || [],
            industry: icp.industries || [],
        };
        console.log('Querying Apollo with:', JSON.stringify(queryParams, null, 2));
        // 2. Fetch leads from Apollo
        const apolloLeads = yield (0, apolloAgent_1.searchApolloContacts)(queryParams, limit);
        console.log(`Fetched ${apolloLeads.length} leads from Apollo`);
        if (apolloLeads.length === 0) {
            console.log('No leads found matching ICP criteria');
            return [];
        }
        // 3. Map Apollo leads to Instantly format
        const mappedLeads = apolloLeads.map(apolloAgent_1.apolloToInstantlyLead);
        console.log(`Mapped ${mappedLeads.length} leads to Instantly format`);
        // 4. Print results for review
        console.log('\n=== LEAD DISCOVERY RESULTS ===');
        mappedLeads.forEach((lead, index) => {
            console.log(`\n${index + 1}. ${lead.first_name} ${lead.last_name}`);
            console.log(`   Job Title: ${lead.job_title}`);
            console.log(`   Company: ${lead.company_name}`);
            console.log(`   Email: ${lead.email}`);
            console.log(`   LinkedIn: ${lead.linkedin_url || 'N/A'}`);
        });
        console.log(`\nTotal leads discovered: ${mappedLeads.length}`);
        return mappedLeads;
    });
}
// Run the workflow if this file is executed directly
if (require.main === module) {
    const limit = process.argv[2] ? parseInt(process.argv[2]) : 100;
    runCompanyToContactWorkflow(limit)
        .then(leads => {
        console.log(`\n✅ Workflow completed successfully!`);
        console.log(`📊 Total leads processed: ${leads.length}`);
    })
        .catch(error => {
        console.error('❌ Workflow failed:', error);
        process.exit(1);
    });
}
