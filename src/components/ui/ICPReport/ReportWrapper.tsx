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

// Utility: Recursively convert any object to array of {key, value} pairs for safe rendering
function objectToPairs(obj: any): Array<{ key: string, value: any }> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: typeof value === 'object' && value !== null && !Array.isArray(value)
      ? objectToPairs(value)
      : value
  }));
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
      // Convert all objects to array of {key, value} pairs for safe rendering
      return objectToPairs(val);
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
      headquarters: flatten(raw.company_overview?.headquarters || raw.headquarters || raw.company_overview?.employees_key_regions || ''),
      revenue: raw.company_overview?.revenue || raw.revenue || '',
      type: raw.company_overview?.company_type || raw.company_type || '',
      funding: raw.company_overview?.funding_status || raw.funding_status || '',
      website: raw.company_overview?.website || raw.website || '',
      notableClients: Array.isArray(raw.client_logos) ? raw.client_logos.map(c => c.category || c.logo_url || c.name || c.company || flatten(c)) : [],
      socialMedia: raw.social_media || raw.company_overview?.social_media || {},
      keyContacts: flatten(raw.company_overview?.key_contacts || []),
      employeesKeyRegions: flatten(raw.company_overview?.employees_key_regions || {}),
    },
    marketIntelligence: {
      mainProducts: flatten(raw.products_positioning?.main_products || raw.main_products || []),
      targetMarket: flatten(raw.products_positioning?.target_market || raw.target_market || {}),
      directCompetitors: flatten(raw.products_positioning?.competitors) || flatten(raw.competitors) || [],
      keyDifferentiators: flatten(raw.products_positioning?.key_differentiators) || flatten(raw.key_differentiators) || [],
      marketTrends: flatten(raw.products_positioning?.market_trends) || flatten(raw.market_trends) || [],
      valuePropositionBySegment: flatten(raw.products_positioning?.value_proposition_by_segment || {}),
      coreProductSuite: raw.products_positioning?.core_product_suite || '',
      keyModules: flatten(raw.products_positioning?.key_modules || []),
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

function ensureArray(val: any) {
  return Array.isArray(val) ? val : [];
}

// Normalization: map backend keys to canonical UI keys
function normalizeCanonical(canonical: any) {
  const norm = { ...canonical };
  // Map products_positioning → market_intelligence
  if (!norm.market_intelligence && norm.products_positioning) {
    norm.market_intelligence = norm.products_positioning;
  }
  // Map icp_and_buying → icp_ibp_framework
  if (!norm.icp_ibp_framework && norm.icp_and_buying) {
    norm.icp_ibp_framework = norm.icp_and_buying;
  }
  // Map features_ecosystem_gtm → technology_stack and sales_gtm_strategy
  if (norm.features_ecosystem_gtm) {
    // --- Sales GTM Strategy ---
    if (!norm.sales_gtm_strategy) norm.sales_gtm_strategy = {};
    const gtm = norm.features_ecosystem_gtm;
    // Map sales_opportunities
    if (gtm.action_steps && Array.isArray(gtm.action_steps.lead_scoring)) {
      norm.sales_gtm_strategy.sales_opportunities = gtm.action_steps.lead_scoring;
    } else {
      norm.sales_gtm_strategy.sales_opportunities = [];
    }
    // Map gtm_recommendations
    if (gtm.gtm_messaging) {
      norm.sales_gtm_strategy.gtm_recommendations = gtm.gtm_messaging;
    } else {
      norm.sales_gtm_strategy.gtm_recommendations = {};
    }
    // Map metrics (try to find a relevant array)
    if (Array.isArray(gtm.metrics)) {
      norm.sales_gtm_strategy.metrics = gtm.metrics;
    } else if (Array.isArray(gtm.kpis_targeted)) {
      norm.sales_gtm_strategy.metrics = gtm.kpis_targeted.map(kpi => ({ label: kpi, value: '' }));
    } else {
      norm.sales_gtm_strategy.metrics = [];
    }
    // --- Technology Stack ---
    if (!norm.technology_stack) norm.technology_stack = {};
    // Map backend_technologies
    if (gtm.key_features && Array.isArray(gtm.key_features.ecommerce_platform)) {
      norm.technology_stack.backend_technologies = gtm.key_features.ecommerce_platform;
    } else {
      norm.technology_stack.backend_technologies = [];
    }
    // Map frontend_technologies (if available)
    if (gtm.key_features && Array.isArray(gtm.key_features.frontend)) {
      norm.technology_stack.frontend_technologies = gtm.key_features.frontend;
    } else {
      norm.technology_stack.frontend_technologies = [];
    }
    // Map infrastructure
    if (gtm.enterprise_readiness && gtm.enterprise_readiness.scalability) {
      norm.technology_stack.infrastructure = Object.values(gtm.enterprise_readiness.scalability).flat();
    } else {
      norm.technology_stack.infrastructure = [];
    }
    // Map key_platform_features
    if (gtm.key_features && Array.isArray(gtm.key_features.business_tools)) {
      norm.technology_stack.key_platform_features = gtm.key_features.business_tools;
    } else {
      norm.technology_stack.key_platform_features = [];
    }
    // Map integration_capabilities
    if (gtm.integrations) {
      norm.technology_stack.integration_capabilities = Object.values(gtm.integrations).flat();
    } else {
      norm.technology_stack.integration_capabilities = [];
    }
    // Map platform_compatibility
    if (gtm.enterprise_readiness && gtm.enterprise_readiness.support) {
      norm.technology_stack.platform_compatibility = Object.values(gtm.enterprise_readiness.support).flat();
    } else {
      norm.technology_stack.platform_compatibility = [];
    }
  }
  // Always provide all sections
  norm.company_overview = norm.company_overview || {};
  norm.market_intelligence = norm.market_intelligence || {};
  norm.icp_ibp_framework = norm.icp_ibp_framework || {};
  norm.sales_gtm_strategy = norm.sales_gtm_strategy || {};
  norm.technology_stack = norm.technology_stack || {};

  // Defensive: ensure all expected array fields are arrays
  if (norm.market_intelligence) {
    norm.market_intelligence.main_products = ensureArray(norm.market_intelligence.main_products);
    norm.market_intelligence.key_differentiators = ensureArray(norm.market_intelligence.key_differentiators);
    norm.market_intelligence.direct_competitors = ensureArray(norm.market_intelligence.direct_competitors);
    norm.market_intelligence.market_trends = ensureArray(norm.market_intelligence.market_trends);
  }
  if (norm.icp_ibp_framework) {
    norm.icp_ibp_framework.buyer_personas = ensureArray(norm.icp_ibp_framework.buyer_personas);
    if (norm.icp_ibp_framework.icp) {
      norm.icp_ibp_framework.icp.company_characteristics = ensureArray(norm.icp_ibp_framework.icp.company_characteristics);
      norm.icp_ibp_framework.icp.technology_profile = ensureArray(norm.icp_ibp_framework.icp.technology_profile);
    }
  }
  if (norm.sales_gtm_strategy) {
    norm.sales_gtm_strategy.sales_opportunities = ensureArray(norm.sales_gtm_strategy.sales_opportunities);
    norm.sales_gtm_strategy.metrics = ensureArray(norm.sales_gtm_strategy.metrics);
  }
  if (norm.technology_stack) {
    norm.technology_stack.backend_technologies = ensureArray(norm.technology_stack.backend_technologies);
    norm.technology_stack.frontend_technologies = ensureArray(norm.technology_stack.frontend_technologies);
    norm.technology_stack.infrastructure = ensureArray(norm.technology_stack.infrastructure);
    norm.technology_stack.key_platform_features = ensureArray(norm.technology_stack.key_platform_features);
    norm.technology_stack.integration_capabilities = ensureArray(norm.technology_stack.integration_capabilities);
    norm.technology_stack.platform_compatibility = ensureArray(norm.technology_stack.platform_compatibility);
  }
  return norm;
}

export default function ReportWrapper({ reportData }: ReportWrapperProps) {
  console.log('[ReportWrapper] Received reportData:', reportData);
  
  // Extract canonical structure - handle both direct canonical and nested llm_output
  let canonical = reportData;
  
  // If reportData has llm_output, use that (this is the canonical structure from backend)
  if (reportData.llm_output) {
    canonical = reportData.llm_output;
    if (typeof canonical === 'string') {
      try {
        canonical = JSON.parse(canonical);
      } catch (e) {
        console.error('[ReportWrapper] Failed to parse llm_output:', e);
        canonical = reportData;
      }
    }
  }
  
  // If reportData has merged field, use that (alternative canonical structure)
  if (reportData.merged) {
    canonical = reportData.merged;
  }
  
  console.log('[ReportWrapper] Using canonical structure:', canonical);
  
  // Normalize keys for UI
  const norm = normalizeCanonical(canonical);
  
  // Extract sections from canonical structure
  const companyOverview = norm.company_overview || {};
  const marketIntelligence = norm.market_intelligence || {};
  const icpIbpFramework = norm.icp_ibp_framework || {};
  const salesGtmStrategy = norm.sales_gtm_strategy || {};
  const technologyStack = norm.technology_stack || {};
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <ExecutiveSummary data={companyOverview} />
      <CompanyOverview data={companyOverview} />
      <MarketIntelligence data={marketIntelligence} />
      <ICPIBPFramework data={icpIbpFramework} />
      <SalesGTMStrategy data={salesGtmStrategy} />
      <TechnologyStack data={technologyStack} />
    </div>
  );
} 