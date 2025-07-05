// This file is auto-generated from new-strcuture-intel.json
// It exports the canonical report wireframe as a TypeScript array
// Updated to match actual backend data structure with unique field mappings

const reportWireframe = [
  {
    title: "Company Snapshot",
    description: "High-level overview of the company for executive context.",
    fields: {
      "Company Name": "company_overview.company_name",
      "Website": "company_overview.website",
      "Revenue": "company_overview.revenue",
      "Employee Count (Global)": "company_overview.company_size",
      "Employee Breakdown (By Region)": "company_overview.employees_global",
      "Funding Status": "company_overview.funding_status",
      "Industry Segments": "company_overview.industry_segments",
      "Overview Summary": "company_overview.overview"
    }
  },
  {
    title: "Firmographics",
    description: "Defines the ideal company profile based on structural attributes.",
    fields: {
      "Business Model": "icp_and_buying.firmographics.business_model",
      "Sales Channels": "icp_and_buying.firmographics.sales_channels",
      "Decision Making": "icp_and_buying.firmographics.decision_making",
      "Growth Stage": "icp_and_buying.firmographics.growth_stage",
      "Industry (Tags)": "icp_and_buying.icp_demographics.industry",
      "Regions (Target Geography)": "icp_and_buying.icp_demographics.region",
      "Revenue Range": "icp_and_buying.icp_demographics.revenue.range",
      "Ideal Revenue": "icp_and_buying.icp_demographics.revenue.ideal",
      "Company Size (Employees)": "icp_and_buying.icp_demographics.size.employees",
      "Size Sweet Spot": "icp_and_buying.icp_demographics.size.sweet_spot"
    }
  },
  {
    title: "Tech Stack & Integration Fit",
    description: "Common tech tools and platforms this ICP typically uses.",
    fields: {
      "Tech Stack Tags": "icp_and_buying.icp_demographics.tech_stack",
      "CRM Platforms": "icp_and_buying.integrations.crm_platforms",
      "ERP Systems": "icp_and_buying.integrations.erp_systems",
      "Payment Gateways": "icp_and_buying.integrations.payment_gateways",
      "Tech Partners": "icp_and_buying.integrations.tech_partners"
    }
  },
  {
    title: "KPIs & Pain Points",
    description: "What this ICP cares about, struggles with, and how success is measured.",
    fields: {
      "Target KPIs": "icp_and_buying.kpis_targeted",
      "Pain Points": "icp_and_buying.pain_points",
      "Disqualification Red Flags": "icp_and_buying.red_flags"
    }
  },
  {
    title: "Buying Committee Breakdown",
    description: "Key roles involved in the decision-making process.",
    fields: {
      "Buyer Personas": "icp_and_buying.buying_committee_personas",
      "Anti-Personas": "icp_and_buying.anti_personas",
      "Influencer Mapping": "icp_and_buying.influencer_mapping"
    }
  },
  {
    title: "Buying Process & Triggers",
    description: "How and when they buy, and what content or events influence purchase decisions.",
    fields: {
      "Buying Stages": "icp_and_buying.buying_process.key_stages",
      "Average Buying Cycle Length": "icp_and_buying.buying_process.average_length",
      "Trigger Events": "icp_and_buying.trigger_events",
      "Content Sought": "icp_and_buying.content_sought"
    }
  },
  {
    title: "Product & GTM Positioning",
    description: "What products are offered and how they are positioned for this ICP.",
    fields: {
      "Core Product Suite": "icp_and_buying.products_positioning.core_product_suite",
      "Main Products": "icp_and_buying.products_positioning.main_products",
      "Modules & Use Cases": "icp_and_buying.products_positioning.key_modules",
      "Target Market": "icp_and_buying.products_positioning.target_market",
      "Unique Selling Points": "icp_and_buying.products_positioning.unique_selling_points",
      "Value Proposition by Segment": "icp_and_buying.products_positioning.value_proposition_by_segment",
      "Market Trends": "icp_and_buying.products_positioning.market_trends",
      "GTM Messaging: CEO": "icp_and_buying.gtm_messaging.talking_points_by_role.ceo",
      "GTM Messaging: CMO": "icp_and_buying.gtm_messaging.talking_points_by_role.cmo",
      "GTM Messaging: CTO": "icp_and_buying.gtm_messaging.talking_points_by_role.cto"
    }
  },
  {
    title: "Product Features & Enterprise Readiness",
    description: "Technical maturity, scalability, and support posture for larger orgs.",
    fields: {
      "API Type": "icp_and_buying.features_ecosystem_gtm.api_type",
      "Customization": "icp_and_buying.features_ecosystem_gtm.customization_options",
      "Developer Tools": "icp_and_buying.features_ecosystem_gtm.developer_tools",
      "Documentation": "icp_and_buying.features_ecosystem_gtm.documentation_quality",
      "App Marketplace": "icp_and_buying.features_ecosystem_gtm.app_marketplace",
      "Hosting": "icp_and_buying.features_ecosystem_gtm.hosting_infrastructure",
      "Performance": "icp_and_buying.features_ecosystem_gtm.performance_metrics",
      "Uptime": "icp_and_buying.features_ecosystem_gtm.uptime_sla",
      "Security Certifications": "icp_and_buying.features_ecosystem_gtm.security_certifications",
      "Security Features": "icp_and_buying.features_ecosystem_gtm.security_features",
      "Support Channels": "icp_and_buying.features_ecosystem_gtm.support_channels",
      "SLA": "icp_and_buying.features_ecosystem_gtm.service_level_agreements"
    }
  },
  {
    title: "Competitive Landscape",
    description: "Competitor fit and positioning across different market segments.",
    fields: {
      "SMB Competitors": "icp_and_buying.features_ecosystem_gtm.competitors.smb.main_competitors",
      "SMB Feature Comparison": "icp_and_buying.features_ecosystem_gtm.competitors.smb.feature_comparison",
      "Mid-Market Competitors": "icp_and_buying.features_ecosystem_gtm.competitors.midmarket.main_competitors",
      "Mid-Market Feature Comparison": "icp_and_buying.features_ecosystem_gtm.competitors.midmarket.feature_comparison",
      "Enterprise Competitors": "icp_and_buying.features_ecosystem_gtm.competitors.enterprise.main_competitors",
      "Enterprise Feature Comparison": "icp_and_buying.features_ecosystem_gtm.competitors.enterprise.feature_comparison",
      "Threats - SMB": "icp_and_buying.features_ecosystem_gtm.competitors.smb.threats",
      "Threats - MM": "icp_and_buying.features_ecosystem_gtm.competitors.midmarket.threats",
      "Threats - Enterprise": "icp_and_buying.features_ecosystem_gtm.competitors.enterprise.threats",
      "Loss/Win Factors": "icp_and_buying.features_ecosystem_gtm.loss_win_analysis",
      "Review Plan": "icp_and_buying.features_ecosystem_gtm.review_plan"
    }
  },
  {
    title: "Case Studies & Proof Points",
    description: "Client examples and preferred content types for social proof and education.",
    fields: {
      "Client Logos + Outcomes": "icp_and_buying.client_logos",
      "Preferred Content Types": "icp_and_buying.gtm_messaging.content_preferences",
      "Objection Handlers": "icp_and_buying.gtm_messaging.objection_handlers"
    }
  },
  {
    title: "ICP Fit Matrix",
    description: "Scoring criteria to determine fit, neutral, or disqualified targets.",
    fields: {
      "ICP Attributes Matrix": "icp_and_buying.icp_fit_matrix.attributes"
    }
  }
];

export default reportWireframe; 