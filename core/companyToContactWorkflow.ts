import { fetchCampaigns, fetchCampaignLeads, importLeadsBulk, fetchLeadLists } from '../agents/researchAgent';
import cliProgress from 'cli-progress';
import fs from 'fs';

// Load ICP from icp.json
function loadICP(icpPath = './icp.json') {
  return JSON.parse(fs.readFileSync(icpPath, 'utf-8'));
}

// Example enrichment/processing function (replace with your own logic)
function enrichInstantlyLead(lead: any) {
  // Add enrichment, LLM, or variable generation here
  return {
    ...lead,
    enriched: true // Example field
  };
}

function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Filter leads by ICP
function leadMatchesICP(lead: any, icp: any) {
  // Region/country
  if (icp.location_country && icp.location_country.length > 0) {
    const country = (lead.country || lead.location_country || '').toLowerCase();
    if (!icp.location_country.some((c: string) => country.includes(c.toLowerCase()))) return false;
  }
  // Company size
  if (icp.company_size && icp.company_size.length > 0) {
    const size = (lead.companySize || lead.company_size || '').toString();
    if (!icp.company_size.some((s: string) => size.includes(s))) return false;
  }
  // Industry
  if (icp.industries && icp.industries.length > 0) {
    const industry = (lead.companyIndustry || lead.industry || '').toLowerCase();
    if (!icp.industries.some((i: string) => industry.includes(i.toLowerCase()))) return false;
  }
  // Job title (VP/Director only)
  if (icp.job_titles && icp.job_titles.length > 0) {
    const jobTitle = (lead.jobTitle || lead.title || '').toLowerCase();
    if (!icp.job_titles.some((t: string) => jobTitle.includes(t.toLowerCase()))) return false;
    if (!/vp|director/.test(jobTitle)) return false;
    if (/manager|associate|intern|assistant/.test(jobTitle)) return false;
  }
  return true;
}

// Less strict ICP filter with fallback field names
function leadMatchesICPLoose(lead: any, icp: any) {
  // Fallbacks for job title
  const jobTitle = (lead.jobTitle || lead.title || '').toLowerCase();
  // Only require VP or Director in job title
  if (!/vp|director/.test(jobTitle)) return false;
  if (/manager|associate|intern|assistant/.test(jobTitle)) return false;
  // Fallbacks for industry
  const industry = (lead.companyIndustry || lead.industry || '').toLowerCase();
  // Fallbacks for country/location
  const country = (lead.country || lead.location_country || lead.location || '').toLowerCase();
  // Only require at least one match for industry or country
  const industryMatch = icp.industries && icp.industries.some((i: string) => industry.includes(i.toLowerCase()));
  const countryMatch = icp.location_country && icp.location_country.some((c: string) => country.includes(c.toLowerCase()));
  return industryMatch || countryMatch;
}

// Relaxed ICP filter: only require VP or Director in job title
function leadMatchesJobTitleOnly(lead: any) {
  const jobTitle = (lead.jobTitle || lead.title || '').toLowerCase();
  return /vp|director/.test(jobTitle) && !/manager|associate|intern|assistant/.test(jobTitle);
}

// Placeholder enrichment for missing fields (industry, country)
async function enrichLeadFields(lead: any) {
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
}

// Map all fields from campaign leads to the import payload, using snake_case keys where possible
function toSnakeCase(obj: any) {
  const out: any = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    out[snakeKey] = obj[key];
  }
  return out;
}

export async function runCompanyToContactWorkflow(limit = 100) {
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
  // const apolloLeads = await searchApolloContacts(queryParams, limit);
  // TODO: Integrate Apollo lead fetching here
  // if (apolloLeads.length === 0) {
  //   console.log('No leads found matching ICP criteria');
  //   return [];
  // }

  // 3. Map Apollo leads to Instantly format
  // const mappedLeads = apolloLeads.map(apolloToInstantlyLead);
  // TODO: Integrate Apollo-to-Instantly mapping here
  // console.log(`Mapped ${mappedLeads.length} leads to Instantly format`);

  // 4. Print results for review
  // console.log('\n=== LEAD DISCOVERY RESULTS ===');
  // mappedLeads.forEach((lead: any, index: number) => {
  //   console.log(`\n${index + 1}. ${lead.first_name} ${lead.last_name}`);
  //   console.log(`   Job Title: ${lead.job_title}`);
  //   console.log(`   Company: ${lead.company_name}`);
  //   console.log(`   Email: ${lead.email}`);
  //   console.log(`   LinkedIn: ${lead.linkedin_url || 'N/A'}`);
  // });

  // console.log(`\nTotal leads discovered: ${mappedLeads.length}`);
  // return mappedLeads;
  // For now, return empty array
  return [];
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