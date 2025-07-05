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

// Deep normalization: recursively map all fields, arrays, and nested objects from LLM output to modular structure
function deepNormalizeLLMOutput(raw: any) {
  if (!raw) return {};
  if (raw.executiveSummary && raw.companyOverview) return raw;
  if (raw.merged && raw.merged.executiveSummary) return raw.merged;

  // Helper to flatten arrays/objects for display
  const flatten = (val: any) => {
    if (Array.isArray(val)) {
      return val.map(flatten);
    } else if (val && typeof val === 'object') {
      // If object has only string/number values, return as key: value pairs
      const keys = Object.keys(val);
      if (keys.every(k => typeof val[k] === 'string' || typeof val[k] === 'number')) {
        return keys.map(k => `${k}: ${val[k]}`);
      }
      // Otherwise, flatten recursively
      return keys.reduce((acc, k) => {
        acc[k] = flatten(val[k]);
        return acc;
      }, {} as any);
    }
    return val;
  };

  // Map all relevant fields, surfacing everything
  return {
    executiveSummary: {
      companyName: raw.company_overview?.company_name || raw.company_name || raw.name || '',
      industry: Array.isArray(raw.company_overview?.industry_segments) ? raw.company_overview.industry_segments.join(', ') : (raw.company_overview?.industry_segments || raw.industry || ''),
      summary: raw.company_overview?.overview || raw.overview || raw.summary || '',
    },
    companyOverview: {
      size: raw.company_overview?.company_size || raw.company_size || '',
      founded: raw.company_overview?.founded || raw.founded || '',
      industry: Array.isArray(raw.company_overview?.industry_segments) ? raw.company_overview.industry_segments.join(', ') : (raw.company_overview?.industry_segments || raw.industry || ''),
      headquarters: raw.company_overview?.headquarters || raw.headquarters || raw.company_overview?.employees_key_regions || '',
      revenue: raw.company_overview?.revenue || raw.revenue || '',
      type: raw.company_overview?.company_type || raw.company_type || '',
      funding: raw.company_overview?.funding_status || raw.funding_status || '',
      website: raw.company_overview?.website || raw.website || '',
      notableClients: Array.isArray(raw.client_logos) ? raw.client_logos.map(c => c.category || c.logo_url || c.name || c.company || flatten(c)) : [],
      socialMedia: raw.social_media || raw.company_overview?.social_media || {},
      keyContacts: raw.company_overview?.key_contacts || [],
      employeesKeyRegions: raw.company_overview?.employees_key_regions || {},
    },
    marketIntelligence: {
      mainProducts: raw.products_positioning?.main_products || raw.main_products || [],
      targetMarket: raw.products_positioning?.target_market || raw.target_market || {},
      directCompetitors: flatten(raw.products_positioning?.competitors) || flatten(raw.competitors) || [],
      keyDifferentiators: flatten(raw.products_positioning?.key_differentiators) || flatten(raw.key_differentiators) || [],
      marketTrends: flatten(raw.products_positioning?.market_trends) || flatten(raw.market_trends) || [],
      valuePropositionBySegment: raw.products_positioning?.value_proposition_by_segment || {},
      coreProductSuite: raw.products_positioning?.core_product_suite || '',
      keyModules: raw.products_positioning?.key_modules || [],
      marketPositioning: raw.products_positioning?.market_positioning || '',
    },
    icpIbps: {
      icp: flatten(raw.icp_and_buying?.icp_demographics) || {},
      firmographics: flatten(raw.icp_and_buying?.firmographics) || {},
      painPoints: flatten(raw.icp_and_buying?.pain_points) || [],
      kpisTargeted: flatten(raw.icp_and_buying?.kpis_targeted) || [],
      buyerPersonas: flatten(raw.icp_and_buying?.buying_committee_personas) || [],
      buyingProcess: flatten(raw.icp_and_buying?.buying_process) || {},
      redFlags: flatten(raw.icp_and_buying?.red_flags) || [],
      antiPersonas: flatten(raw.icp_and_buying?.anti_personas) || [],
    },
    salesGtmStrategy: {
      salesOpportunities: flatten(raw.features_ecosystem_gtm?.action_steps?.lead_scoring) || [],
      gtmRecommendations: flatten(raw.features_ecosystem_gtm?.gtm_messaging) || {},
      metrics: flatten(raw.icp_and_buying?.kpis_targeted) ? raw.icp_and_buying.kpis_targeted.map((k: string) => ({ label: k, value: '' })) : [],
      reviewPlan: flatten(raw.features_ecosystem_gtm?.action_steps?.review_plan) || [],
      lossWinAnalysis: flatten(raw.features_ecosystem_gtm?.action_steps?.loss_win_analysis) || [],
      objectionHandlers: flatten(raw.features_ecosystem_gtm?.gtm_messaging?.objection_handlers) || {},
      talkingPointsByRole: flatten(raw.features_ecosystem_gtm?.gtm_messaging?.talking_points_by_role) || {},
    },
    technologyStack: {
      backendTechnologies: flatten(raw.key_features?.backend) || [],
      frontendTechnologies: flatten(raw.key_features?.frontend) || [],
      infrastructure: raw.enterprise_readiness ? flatten([raw.enterprise_readiness.hosting, raw.enterprise_readiness.performance, raw.enterprise_readiness.uptime]) : [],
      keyPlatformFeatures: flatten(raw.features_ecosystem_gtm?.key_features) || [],
      integrationCapabilities: raw.integrations ? flatten(Object.values(raw.integrations)) : [],
      platformCompatibility: raw.enterprise_readiness ? flatten([raw.enterprise_readiness.performance, raw.enterprise_readiness.uptime]) : [],
      certifications: flatten(raw.enterprise_readiness?.security?.certifications) || [],
      features: flatten(raw.enterprise_readiness?.security?.features) || [],
      apiOpenness: flatten(raw.features_ecosystem_gtm?.api_openness) || {},
      developerResources: flatten(raw.features_ecosystem_gtm?.api_openness?.developer_resources) || '',
      documentationQuality: flatten(raw.features_ecosystem_gtm?.api_openness?.documentation_quality) || '',
    }
  };
}

export default function ReportWrapper({ reportData }: ReportWrapperProps) {
  let data = typeof reportData.llm_output === 'string' 
    ? JSON.parse(reportData.llm_output) 
    : reportData.llm_output || reportData;

  // Always deeply normalize the data for the UI
  const modular = deepNormalizeLLMOutput(data);

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