// This file is auto-generated from new-strcuture-intel.json
// It exports the canonical report wireframe as a TypeScript array
// Updated to match actual backend canonical structure

const reportWireframe = [
  {
    title: "Company Snapshot",
    description: "High-level overview of the company for executive context.",
    fields: {
      "Company Name": "company_name",
      "Website": "company_overview.website",
      "Revenue": "company_overview.revenue_range",
      "Employee Count (Global)": "company_overview.company_size",
      "Employee Breakdown (By Region)": "company_overview.headquarters",
      "Funding Status": "company_overview.funding_status",
      "Industry Segments": "company_overview.industry",
      "Overview Summary": "company_overview.summary"
    }
  },
  {
    title: "Firmographics",
    description: "Defines the ideal company profile based on structural attributes.",
    fields: {
      "Business Model": "icp_ibp_framework.icp.company_characteristics",
      "Sales Channels": "sales_gtm_strategy.gtm_recommendations.vertical_specific_solutions",
      "Decision Making": "icp_ibp_framework.buyer_personas",
      "Growth Stage": "company_overview.company_type",
      "Industry (Tags)": "company_overview.industry",
      "Regions (Target Geography)": "company_overview.headquarters",
      "Revenue Range": "company_overview.revenue_range",
      "Ideal Revenue": "company_overview.revenue_range",
      "Company Size (Employees)": "company_overview.company_size",
      "Size Sweet Spot": "company_overview.company_size"
    }
  },
  {
    title: "Tech Stack & Integration Fit",
    description: "Common tech tools and platforms this ICP typically uses.",
    fields: {
      "Tech Stack Tags": "technology_stack.backend_technologies",
      "CRM Platforms": "technology_stack.integration_capabilities",
      "ERP Systems": "technology_stack.integration_capabilities",
      "Payment Gateways": "technology_stack.integration_capabilities",
      "Tech Partners": "technology_stack.integration_capabilities"
    }
  },
  {
    title: "KPIs & Pain Points",
    description: "What this ICP cares about, struggles with, and how success is measured.",
    fields: {
      "Target KPIs": "sales_gtm_strategy.metrics",
      "Pain Points": "icp_ibp_framework.buyer_personas",
      "Disqualification Red Flags": "icp_ibp_framework.icp.company_characteristics"
    }
  },
  {
    title: "Buying Committee Breakdown",
    description: "Key roles involved in the decision-making process.",
    fields: {
      "Buyer Personas": "icp_ibp_framework.buyer_personas",
      "Anti-Personas": "icp_ibp_framework.icp.company_characteristics",
      "Influencer Mapping": "icp_ibp_framework.buyer_personas"
    }
  },
  {
    title: "Buying Process & Triggers",
    description: "How and when they buy, and what content or events influence purchase decisions.",
    fields: {
      "Buying Stages": "sales_gtm_strategy.sales_opportunities",
      "Average Buying Cycle Length": "sales_gtm_strategy.sales_opportunities",
      "Trigger Events": "sales_gtm_strategy.sales_opportunities",
      "Content Sought": "sales_gtm_strategy.gtm_recommendations.content_marketing"
    }
  },
  {
    title: "Product & GTM Positioning",
    description: "What products are offered and how they are positioned for this ICP.",
    fields: {
      "Core Product Suite": "market_intelligence.main_products",
      "Main Products": "market_intelligence.main_products",
      "Modules & Use Cases": "market_intelligence.target_market",
      "Target Market": "market_intelligence.target_market",
      "Unique Selling Points": "market_intelligence.key_differentiators",
      "Value Proposition by Segment": "market_intelligence.target_market",
      "Market Trends": "market_intelligence.market_trends",
      "GTM Messaging: CEO": "sales_gtm_strategy.gtm_recommendations.sales_enablement",
      "GTM Messaging: CMO": "sales_gtm_strategy.gtm_recommendations.content_marketing",
      "GTM Messaging: CTO": "sales_gtm_strategy.gtm_recommendations.vertical_specific_solutions"
    }
  },
  {
    title: "Product Features & Enterprise Readiness",
    description: "Technical maturity, scalability, and support posture for larger orgs.",
    fields: {
      "API Type": "technology_stack.integration_capabilities",
      "Customization": "technology_stack.key_platform_features",
      "Developer Tools": "technology_stack.frontend_technologies",
      "Documentation": "technology_stack.integration_capabilities",
      "App Marketplace": "technology_stack.integration_capabilities",
      "Hosting": "technology_stack.infrastructure",
      "Performance": "technology_stack.platform_compatibility",
      "Uptime": "technology_stack.platform_compatibility",
      "Security Certifications": "technology_stack.platform_compatibility",
      "Security Features": "technology_stack.platform_compatibility",
      "Support Channels": "technology_stack.platform_compatibility",
      "SLA": "technology_stack.platform_compatibility"
    }
  },
  {
    title: "Competitive Landscape",
    description: "Competitor fit and positioning across different market segments.",
    fields: {
      "SMB Competitors": "market_intelligence.direct_competitors",
      "SMB Feature Comparison": "market_intelligence.key_differentiators",
      "Mid-Market Competitors": "market_intelligence.direct_competitors",
      "Mid-Market Feature Comparison": "market_intelligence.key_differentiators",
      "Enterprise Competitors": "market_intelligence.direct_competitors",
      "Enterprise Feature Comparison": "market_intelligence.key_differentiators",
      "Threats - SMB": "market_intelligence.direct_competitors",
      "Threats - MM": "market_intelligence.direct_competitors",
      "Threats - Enterprise": "market_intelligence.direct_competitors",
      "Loss/Win Factors": "sales_gtm_strategy.sales_opportunities",
      "Review Plan": "sales_gtm_strategy.sales_opportunities"
    }
  },
  {
    title: "Case Studies & Proof Points",
    description: "Client examples and preferred content types for social proof and education.",
    fields: {
      "Client Logos + Outcomes": "company_overview.notable_clients",
      "Preferred Content Types": "sales_gtm_strategy.gtm_recommendations.content_marketing",
      "Objection Handlers": "sales_gtm_strategy.gtm_recommendations.sales_enablement"
    }
  },
  {
    title: "ICP Fit Matrix",
    description: "Scoring criteria to determine fit, neutral, or disqualified targets.",
    fields: {
      "ICP Attributes Matrix": "icp_ibp_framework.icp.company_characteristics"
    }
  }
];

export default reportWireframe; 