import React from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import CompanyOverview from './CompanyOverview';
import MarketIntelligence from './MarketIntelligence';
import ICPIBPFramework from './ICPIBPFramework';
import SalesGTMStrategy from './SalesGTMStrategy';
import TechnologyStack from './TechnologyStack';

interface ReportWrapperProps {
  reportData: any;
}

// Normalization function: maps raw LLM output to modular structure for UI
function normalizeLLMOutput(raw: any) {
  if (!raw) return {};
  // If already modular, return as is
  if (raw.executiveSummary && raw.companyOverview) return raw;
  // If wrapped in .merged, use that
  if (raw.merged && raw.merged.executiveSummary) return raw.merged;

  // Try to map from known LLM output keys
  return {
    executiveSummary: {
      companyName: raw.company_overview?.company_name || raw.company_name || raw.name || '',
      industry: Array.isArray(raw.company_overview?.industry_segments) ? raw.company_overview.industry_segments[0] : (raw.company_overview?.industry_segments || raw.industry || ''),
      summary: raw.company_overview?.overview || raw.overview || raw.summary || '',
    },
    companyOverview: {
      size: raw.company_overview?.company_size || raw.company_size || '',
      founded: raw.company_overview?.founded || raw.founded || '',
      industry: Array.isArray(raw.company_overview?.industry_segments) ? raw.company_overview.industry_segments[0] : (raw.company_overview?.industry_segments || raw.industry || ''),
      headquarters: raw.company_overview?.headquarters || raw.headquarters || '',
      revenue: raw.company_overview?.revenue || raw.revenue || '',
      type: raw.company_overview?.company_type || raw.company_type || '',
      funding: raw.company_overview?.funding_status || raw.funding_status || '',
      website: raw.company_overview?.website || raw.website || '',
      notableClients: Array.isArray(raw.client_logos) ? raw.client_logos.map(c => c.category || c.logo_url || c.name || c.company || '') : [],
      socialMedia: raw.social_media || {},
    },
    marketIntelligence: {
      mainProducts: raw.products_positioning?.main_products || raw.main_products || [],
      targetMarket: raw.products_positioning?.target_market || raw.target_market || {},
      directCompetitors: raw.products_positioning?.competitors?.Enterprise || raw.competitors?.Enterprise || [],
      keyDifferentiators: raw.products_positioning?.key_differentiators?.integrations || raw.key_differentiators || [],
      marketTrends: raw.products_positioning?.market_trends || raw.market_trends || [],
    },
    icpIbps: {
      icp: raw.icp_and_buying?.icp_demographics || {},
      buyerPersonas: raw.icp_and_buying?.buying_committee_personas || [],
    },
    salesGtmStrategy: {
      salesOpportunities: raw.features_ecosystem_gtm?.action_steps?.lead_scoring || [],
      gtmRecommendations: raw.features_ecosystem_gtm?.gtm_messaging || {},
      metrics: raw.icp_and_buying?.kpis_targeted ? raw.icp_and_buying.kpis_targeted.map((k: string) => ({ label: k, value: '' })) : [],
    },
    technologyStack: {
      backendTechnologies: raw.key_features?.backend || [],
      frontendTechnologies: raw.key_features?.frontend || [],
      infrastructure: raw.enterprise_readiness ? [raw.enterprise_readiness.hosting, raw.enterprise_readiness.performance, raw.enterprise_readiness.uptime].filter(Boolean) : [],
      keyPlatformFeatures: raw.features_ecosystem_gtm?.key_features || [],
      integrationCapabilities: raw.integrations ? Object.values(raw.integrations).flat() : [],
      platformCompatibility: raw.enterprise_readiness ? [raw.enterprise_readiness.performance, raw.enterprise_readiness.uptime].filter(Boolean) : [],
    }
  };
}

export default function ReportWrapper({ reportData }: ReportWrapperProps) {
  let data = typeof reportData.llm_output === 'string' 
    ? JSON.parse(reportData.llm_output) 
    : reportData.llm_output || reportData;

  // Always normalize the data for the UI
  const modular = normalizeLLMOutput(data);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <ExecutiveSummary data={modular.executiveSummary || {}} />
      <CompanyOverview data={modular.companyOverview || {}} />
      <MarketIntelligence data={modular.marketIntelligence || {}} />
      <ICPIBPFramework data={modular.icpIbps || {}} />
      <SalesGTMStrategy data={modular.salesGtmStrategy || {}} />
      <TechnologyStack data={modular.technologyStack || {}} />
    </div>
  );
} 