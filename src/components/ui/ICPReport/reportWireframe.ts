// This file is auto-generated from new-strcuture-intel.json
// It exports the canonical report wireframe as a TypeScript array

const reportWireframe = [
  {
    title: "Company Snapshot",
    description: "High-level overview of the company for executive context.",
    fields: {
      "Company Name": "company_overview.company_name",
      "Website": "company_overview.website",
      "Revenue": "company_overview.revenue",
      "Employee Count (Global)": "company_overview.employees_global",
      "Employee Breakdown (By Region)": "company_overview.employees_key_regions",
      "Funding Status": "company_overview.funding_status",
      "Industry Segments": "company_overview.industry_segments",
      "Overview Summary": "company_overview.overview"
    }
  },
  {
    title: "Firmographics",
    description: "Defines the ideal company profile based on structural attributes.",
    fields: {
      "Business Model": "firmographics.business_model",
      "Sales Channels": "firmographics.sales_channels",
      "Decision Making": "firmographics.decision_making",
      "Growth Stage": "firmographics.growth_stage",
      "Industry (Tags)": "icp_demographics.industry",
      "Regions (Target Geography)": "icp_demographics.region",
      "Revenue Range": "icp_demographics.revenue.range",
      "Ideal Revenue": "icp_demographics.revenue.ideal",
      "Company Size (Employees)": "icp_demographics.size.employees",
      "Size Sweet Spot": "icp_demographics.size.sweet_spot"
    }
  },
  {
    title: "Tech Stack & Integration Fit",
    description: "Common tech tools and platforms this ICP typically uses.",
    fields: {
      "Tech Stack Tags": "tech_stack",
      "CRM Platforms": "integrations.crm_platforms",
      "ERP Systems": "integrations.erp_systems",
      "Payment Gateways": "integrations.payment_gateways",
      "Tech Partners": "integrations.tech_partners"
    }
  },
  {
    title: "KPIs & Pain Points",
    description: "What this ICP cares about, struggles with, and how success is measured.",
    fields: {
      "Target KPIs": "kpis_targeted",
      "Pain Points": "pain_points",
      "Disqualification Red Flags": "red_flags"
    }
  },
  {
    title: "Buying Committee Breakdown",
    description: "Key roles involved in the decision-making process.",
    fields: {
      "Buyer Personas": "buying_committee_personas",
      "Anti-Personas": "anti_personas",
      "Influencer Mapping": "influencer_mapping"
    }
  },
  {
    title: "Buying Process & Triggers",
    description: "How and when they buy, and what content or events influence purchase decisions.",
    fields: {
      "Buying Stages": "buying_process.key_stages",
      "Average Buying Cycle Length": "buying_process.average_length",
      "Trigger Events": "trigger_events",
      "Content Sought": "content_sought"
    }
  },
  {
    title: "Product & GTM Positioning",
    description: "What products are offered and how they are positioned for this ICP.",
    fields: {
      "Core Product Suite": "products_positioning.core_product_suite",
      "Main Products": "products_positioning.main_products",
      "Modules & Use Cases": "products_positioning.key_modules",
      "Target Market": "products_positioning.target_market",
      "Unique Selling Points": "products_positioning.unique_selling_points",
      "Value Proposition by Segment": "products_positioning.value_proposition_by_segment",
      "Market Trends": "products_positioning.market_trends",
      "GTM Messaging: CEO": "gtm_messaging.talking_points_by_role.ceo",
      "GTM Messaging: CMO": "gtm_messaging.talking_points_by_role.cmo",
      "GTM Messaging: CTO": "gtm_messaging.talking_points_by_role.cto"
    }
  },
  {
    title: "Product Features & Enterprise Readiness",
    description: "Technical maturity, scalability, and support posture for larger orgs.",
    fields: {
      "API Type": "features_ecosystem_gtm.api_openness.api_type",
      "Customization": "features_ecosystem_gtm.customization",
      "Developer Tools": "features_ecosystem_gtm.developer_tools",
      "Documentation": "features_ecosystem_gtm.documentation",
      "App Marketplace": "features_ecosystem_gtm.app_marketplace",
      "Hosting": "features_ecosystem_gtm.enterprise_readiness.hosting",
      "Performance": "features_ecosystem_gtm.enterprise_readiness.performance",
      "Uptime": "features_ecosystem_gtm.enterprise_readiness.uptime",
      "Security Certifications": "features_ecosystem_gtm.security.certifications",
      "Security Features": "features_ecosystem_gtm.security.features",
      "Support Channels": "features_ecosystem_gtm.support.channels",
      "SLA": "features_ecosystem_gtm.support.sla"
    }
  },
  {
    title: "Competitive Landscape",
    description: "Competitor fit and positioning across different market segments.",
    fields: {
      "SMB Competitors": "features_ecosystem_gtm.competitors.smb.main_competitors",
      "SMB Feature Comparison": "features_ecosystem_gtm.competitors.smb.feature_comparison",
      "Mid-Market Competitors": "features_ecosystem_gtm.competitors.midmarket.main_competitors",
      "Mid-Market Feature Comparison": "features_ecosystem_gtm.competitors.midmarket.feature_comparison",
      "Enterprise Competitors": "features_ecosystem_gtm.competitors.enterprise.main_competitors",
      "Enterprise Feature Comparison": "features_ecosystem_gtm.competitors.enterprise.feature_comparison",
      "Threats - SMB": "features_ecosystem_gtm.competitors.smb.threats",
      "Threats - MM": "features_ecosystem_gtm.competitors.midmarket.threats",
      "Threats - Enterprise": "features_ecosystem_gtm.competitors.enterprise.threats",
      "Loss/Win Factors": "features_ecosystem_gtm.loss_win_analysis",
      "Review Plan": "features_ecosystem_gtm.review_plan"
    }
  },
  {
    title: "Case Studies & Proof Points",
    description: "Client examples and preferred content types for social proof and education.",
    fields: {
      "Client Logos + Outcomes": "client_logos",
      "Preferred Content Types": "gtm_messaging.content_preferences",
      "Objection Handlers": "gtm_messaging.objection_handlers"
    }
  },
  {
    title: "ICP Fit Matrix",
    description: "Scoring criteria to determine fit, neutral, or disqualified targets.",
    fields: {
      "ICP Attributes Matrix": "icp_fit_matrix.attributes"
    }
  }
];

export default reportWireframe; 