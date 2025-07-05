// This file is auto-generated from new-strcuture-intel.json
// It exports the canonical report wireframe as a TypeScript array
// Updated to match actual backend data structure

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
      "CRM Platforms": "icp_and_buying.icp_demographics.tech_stack",
      "ERP Systems": "icp_and_buying.icp_demographics.tech_stack",
      "Payment Gateways": "icp_and_buying.icp_demographics.tech_stack",
      "Tech Partners": "icp_and_buying.icp_demographics.tech_stack"
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
      "Main Products": "company_overview.overview",
      "Modules & Use Cases": "company_overview.overview",
      "Target Market": "icp_and_buying.icp_demographics.industry",
      "Unique Selling Points": "company_overview.overview",
      "Value Proposition by Segment": "company_overview.overview",
      "Market Trends": "company_overview.overview",
      "GTM Messaging: CEO": "company_overview.overview",
      "GTM Messaging: CMO": "company_overview.overview",
      "GTM Messaging: CTO": "company_overview.overview"
    }
  },
  {
    title: "Product Features & Enterprise Readiness",
    description: "Technical maturity, scalability, and support posture for larger orgs.",
    fields: {
      "API Type": "company_overview.overview",
      "Customization": "company_overview.overview",
      "Developer Tools": "company_overview.overview",
      "Documentation": "company_overview.overview",
      "App Marketplace": "company_overview.overview",
      "Hosting": "company_overview.overview",
      "Performance": "company_overview.overview",
      "Uptime": "company_overview.overview",
      "Security Certifications": "company_overview.overview",
      "Security Features": "company_overview.overview",
      "Support Channels": "company_overview.overview",
      "SLA": "company_overview.overview"
    }
  },
  {
    title: "Competitive Landscape",
    description: "Competitor fit and positioning across different market segments.",
    fields: {
      "SMB Competitors": "company_overview.overview",
      "SMB Feature Comparison": "company_overview.overview",
      "Mid-Market Competitors": "company_overview.overview",
      "Mid-Market Feature Comparison": "company_overview.overview",
      "Enterprise Competitors": "company_overview.overview",
      "Enterprise Feature Comparison": "company_overview.overview",
      "Threats - SMB": "company_overview.overview",
      "Threats - MM": "company_overview.overview",
      "Threats - Enterprise": "company_overview.overview",
      "Loss/Win Factors": "company_overview.overview",
      "Review Plan": "company_overview.overview"
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