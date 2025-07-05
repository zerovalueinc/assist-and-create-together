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
      "Industry Segments": "icp_and_buying.icp_demographics.industry",
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
      "Revenue Range": "icp_and_buying.icp_demographics.revenue",
      "Ideal Revenue": "icp_and_buying.icp_demographics.revenue",
      "Company Size (Employees)": "icp_and_buying.icp_demographics.size.employees",
      "Size Sweet Spot": "icp_and_buying.icp_demographics.size.sweet_spot"
    }
  },
  {
    title: "Tech Stack & Integration Fit",
    description: "Common tech tools and platforms this ICP typically uses.",
    fields: {
      "Tech Stack Tags": "icp_and_buying.icp_demographics.tech_stack",
      "CRM Platforms": "icp_and_buying.firmographics.business_model",
      "ERP Systems": "icp_and_buying.icp_demographics.industry",
      "Payment Gateways": "icp_and_buying.icp_demographics.revenue",
      "Tech Partners": "icp_and_buying.buying_process.influencer_mapping"
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
      "Influencer Mapping": "icp_and_buying.buying_process.influencer_mapping"
    }
  },
  {
    title: "Buying Process & Triggers",
    description: "How and when they buy, and what content or events influence purchase decisions.",
    fields: {
      "Buying Stages": "icp_and_buying.buying_process.buying_cycles.key_stages",
      "Average Buying Cycle Length": "icp_and_buying.buying_process.buying_cycles.average_length",
      "Trigger Events": "icp_and_buying.buying_process.trigger_events",
      "Content Sought": "icp_and_buying.buying_process.content_sought"
    }
  },
  {
    title: "Product & GTM Positioning",
    description: "What products are offered and how they are positioned for this ICP.",
    fields: {
      "Core Product Suite": "company_overview.overview",
      "Main Products": "icp_and_buying.firmographics.business_model",
      "Modules & Use Cases": "icp_and_buying.icp_demographics.tech_stack",
      "Target Market": "icp_and_buying.icp_demographics.industry",
      "Unique Selling Points": "icp_and_buying.kpis_targeted",
      "Value Proposition by Segment": "icp_and_buying.icp_demographics.revenue",
      "Market Trends": "icp_and_buying.buying_process.trigger_events",
      "GTM Messaging: CEO": "icp_and_buying.buying_committee_personas",
      "GTM Messaging: CMO": "icp_and_buying.buying_process.content_sought",
      "GTM Messaging: CTO": "icp_and_buying.icp_demographics.tech_stack"
    }
  },
  {
    title: "Product Features & Enterprise Readiness",
    description: "Technical maturity, scalability, and support posture for larger orgs.",
    fields: {
      "API Type": "icp_and_buying.icp_demographics.tech_stack",
      "Customization": "icp_and_buying.firmographics.business_model",
      "Developer Tools": "icp_and_buying.buying_process.content_sought",
      "Documentation": "icp_and_buying.kpis_targeted",
      "App Marketplace": "icp_and_buying.icp_demographics.industry",
      "Hosting": "icp_and_buying.icp_demographics.region",
      "Performance": "icp_and_buying.pain_points",
      "Uptime": "icp_and_buying.buying_process.buying_cycles.average_length",
      "Security Certifications": "icp_and_buying.red_flags",
      "Security Features": "icp_and_buying.anti_personas",
      "Support Channels": "icp_and_buying.buying_process.influencer_mapping",
      "SLA": "icp_and_buying.icp_demographics.revenue"
    }
  },
  {
    title: "Competitive Landscape",
    description: "Competitor fit and positioning across different market segments.",
    fields: {
      "SMB Competitors": "icp_and_buying.icp_demographics.industry",
      "SMB Feature Comparison": "icp_and_buying.firmographics.business_model",
      "Mid-Market Competitors": "icp_and_buying.icp_demographics.tech_stack",
      "Mid-Market Feature Comparison": "icp_and_buying.kpis_targeted",
      "Enterprise Competitors": "icp_and_buying.icp_demographics.size.employees",
      "Enterprise Feature Comparison": "icp_and_buying.pain_points",
      "Threats - SMB": "icp_and_buying.red_flags",
      "Threats - MM": "icp_and_buying.anti_personas",
      "Threats - Enterprise": "icp_and_buying.buying_process.trigger_events",
      "Loss/Win Factors": "icp_and_buying.buying_process.content_sought",
      "Review Plan": "icp_and_buying.buying_process.buying_cycles.key_stages"
    }
  },
  {
    title: "Case Studies & Proof Points",
    description: "Client examples and preferred content types for social proof and education.",
    fields: {
      "Client Logos + Outcomes": "company_overview.key_contacts",
      "Preferred Content Types": "icp_and_buying.buying_process.content_sought",
      "Objection Handlers": "icp_and_buying.red_flags"
    }
  },
  {
    title: "ICP Fit Matrix",
    description: "Scoring criteria to determine fit, neutral, or disqualified targets.",
    fields: {
      "ICP Attributes Matrix": "icp_and_buying.firmographics"
    }
  }
];

export default reportWireframe; 