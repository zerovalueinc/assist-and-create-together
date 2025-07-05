import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building, BarChart2, Users, Rocket, Code } from 'lucide-react';
import { prettifyLabel } from '../../lib/utils';

// Import the mapping table
import reportMapping from '../../../reportstructure.json';

interface CanonicalReportRendererProps {
  reportData: any;
}

// Icon mapping for sections
const sectionIcons = {
  company_overview: Building,
  market_intelligence: BarChart2,
  icp_ibp_framework: Users,
  sales_gtm_strategy: Rocket,
  technology_stack: Code,
};

// Component for rendering company header
const CompanyHeader: React.FC<{ companyName: string }> = ({ companyName }) => (
  <div className="flex items-center gap-3 mb-2">
    <Building className="h-7 w-7 text-primary" />
    <h2 className="company-name text-3xl font-extrabold text-gray-900 mb-0">{companyName}</h2>
  </div>
);

// Component for rendering two-column grid
const TwoColumnGrid: React.FC<{ leftFields: any; rightFields: any }> = ({ leftFields, rightFields }) => (
  <div className="two-column-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div className="left-column">
      <div className="subsection-title font-semibold text-lg mb-3">Company Overview</div>
      <div className="field-list space-y-3">
        {Object.entries(leftFields).map(([key, value]) => (
          <div key={`left-${key}`} className="field-item">
            <div className="field-label font-medium text-gray-700 mb-1">{prettifyLabel(key)}</div>
            <div className="field-value text-gray-900">{renderValue(value)}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="right-column">
      <div className="subsection-title font-semibold text-lg mb-3">Business Details</div>
      <div className="field-list space-y-3">
        {Object.entries(rightFields).map(([key, value]) => (
          <div key={`right-${key}`} className="field-item">
            <div className="field-label font-medium text-gray-700 mb-1">{prettifyLabel(key)}</div>
            <div className="field-value text-gray-900">{renderValue(value)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Component for rendering description
const Description: React.FC<{ content: string }> = ({ content }) => (
  <div className="subsection mb-6">
    <div className="detail-value text-lg font-medium text-gray-800">{content}</div>
  </div>
);

// Component for rendering client list
const ClientList: React.FC<{ clients: any[] }> = ({ clients }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-3">Notable Clients</div>
    <div className="client-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client, i) => {
        // Handle both string clients and object clients
        const clientName = typeof client === 'string' ? client : 
                          (client.name || client.company || client.logo_url || 'Unknown Client');
        const clientCategory = typeof client === 'object' ? client.category : '';
        
        return (
          <div key={i} className="client-item bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="client-name font-medium text-orange-900">{clientName}</div>
            {clientCategory && <div className="client-category text-sm text-orange-700">{clientCategory}</div>}
          </div>
        );
      })}
    </div>
  </div>
);

// Component for rendering social links
const SocialLinks: React.FC<{ socialMedia: any }> = ({ socialMedia }) => (
  <div className="subsection mb-2">
    <div className="subsection-title font-semibold text-lg mb-2">Social Media</div>
    <div className="social-links flex gap-4">
      {socialMedia.twitter && (
        <a href={socialMedia.twitter} className="social-link text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
      )}
      {socialMedia.facebook && (
        <a href={socialMedia.facebook} className="social-link text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      )}
      {socialMedia.linkedin && (
        <a href={socialMedia.linkedin} className="social-link text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      )}
    </div>
  </div>
);

// TagList component for tag/badge style lists
const TagList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {items.map((item, i) => (
      <span key={i} className="inline-block bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
        {item}
      </span>
    ))}
  </div>
);

// Helper to strip index numbers from LLM output
function stripIndexes(val: any): string {
  if (typeof val === 'string') {
    return val.replace(/\b\d+[:：]\s*/g, '').replace(/;+$/, '').trim();
  }
  if (Array.isArray(val)) {
    return val.map(stripIndexes).join(', ');
  }
  if (typeof val === 'object' && val !== null) {
    return Object.values(val).map(stripIndexes).join(', ');
  }
  return String(val);
}

// Updated sanitizer to strip index numbers and prettify arrays/objects
function sanitizeReportData(data: any) {
  const sanitizeArray = (arr: any[], key?: string) => {
    if (!Array.isArray(arr)) return [];
    let values = arr.map(item => {
      if (typeof item === 'string') {
        let v = stripIndexes(item);
        if (v.match(/^https?:\/\//)) {
          try {
            const url = new URL(v);
            return url.hostname.replace('www.', '');
          } catch { return v; }
        }
        return v;
      }
      if (typeof item === 'object' && item !== null) {
        if (key && item[key]) return stripIndexes(item[key]);
        if (item.name) return stripIndexes(item.name);
        if (item.title) return stripIndexes(item.title);
        if (item.company) return stripIndexes(item.company);
        if (item.logo_url) return item.logo_url.split('/').pop();
        if (item.category) return stripIndexes(item.category);
        return Object.values(item).map(stripIndexes).join(', ');
      }
      return stripIndexes(String(item));
    });
    values = [...new Set(values)].filter(Boolean);
    return values.length ? values : [];
  };
  const sanitizeField = (val: any, key?: string) => {
    if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) return '';
    if (Array.isArray(val)) return sanitizeArray(val, key).join(', ');
    if (typeof val === 'object') {
      return Object.entries(val).map(([k, v]) => `${prettifyLabel(k)}: ${sanitizeField(v)}`).join('; ');
    }
    if (typeof val === 'string') {
      return stripIndexes(val.charAt(0).toUpperCase() + val.slice(1));
    }
    return stripIndexes(String(val));
  };
  const sanitized: any = { ...data };
  if (sanitized.notable_clients) sanitized.notable_clients = sanitizeArray(sanitized.notable_clients);
  if (sanitized.main_products) sanitized.main_products = sanitizeArray(sanitized.main_products);
  if (sanitized.direct_competitors) sanitized.direct_competitors = sanitizeArray(sanitized.direct_competitors);
  if (sanitized.key_platform_features) sanitized.key_platform_features = sanitizeArray(sanitized.key_platform_features);
  if (sanitized.integration_capabilities) sanitized.integration_capabilities = sanitizeArray(sanitized.integration_capabilities);
  if (sanitized.platform_compatibility) sanitized.platform_compatibility = sanitizeArray(sanitized.platform_compatibility);
  if (sanitized.buyer_personas) sanitized.buyer_personas = sanitized.buyer_personas.map((p: any) => {
    const demographics = sanitizeField(p.demographics);
    const pain_points = sanitizeField(p.pain_points);
    const success_metrics = sanitizeField(p.success_metrics);
    return {
      title: stripIndexes(p.title || p.role || ''),
      demographics,
      pain_points,
      success_metrics,
      hasAny: Boolean(demographics || pain_points || success_metrics)
    };
  });
  if (sanitized.market_trends) sanitized.market_trends = sanitizeArray(sanitized.market_trends);
  [
    'main_products', 'direct_competitors', 'key_platform_features', 'integration_capabilities', 'platform_compatibility', 'market_trends'
  ].forEach(field => {
    if (sanitized[field]) sanitized[field] = Array.isArray(sanitized[field]) ? [...new Set(sanitized[field])] : sanitized[field];
  });
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] == null || sanitized[key] === '' || (Array.isArray(sanitized[key]) && sanitized[key].length === 0)) {
      sanitized[key] = '';
    }
  });
  return sanitized;
}

// Refactored ICPDisplay to strictly match canonical structure
const ICPDisplay: React.FC<{ icp: any }> = ({ icp }) => {
  if (!icp || Object.keys(icp).length === 0 || icp === '') {
    return <div className="text-gray-500 italic">No ICP data found.</div>;
  }
  // Only show fields as defined in reportstructure.json
  const fields = [
    { key: 'company_characteristics', label: 'Company Characteristics' },
    { key: 'technology_profile', label: 'Technology Profile' }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {fields.map(({ key, label }) => {
        const value = icp[key];
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        return (
          <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col justify-center">
            <div className="font-semibold text-gray-700 mb-1" style={{fontSize:'1rem'}}>{label}</div>
            {Array.isArray(value) ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {value.map((v: string, i: number) => (
                  <span key={i} className="inline-block bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">{v}</span>
                ))}
              </div>
            ) : (
              <div className="text-gray-900" style={{fontSize:'1.05rem', fontWeight:500}}>{value}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Refactored BuyerPersonas to strictly match canonical structure
const BuyerPersonas: React.FC<{ personas: any[] }> = ({ personas }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">Buyer Personas</div>
    {(!personas || personas.length === 0) && (
      <div className="text-gray-500 italic">No personas found.</div>
    )}
    {personas && personas.map((persona, i) => (
      <div key={i} className="buyer-persona bg-purple-50 border border-purple-400 rounded-lg p-4 mb-3">
        <div className="persona-title font-semibold text-purple-900 mb-2">{persona.title || ''}</div>
        <div className="flex flex-col gap-2">
          {persona.demographics && Array.isArray(persona.demographics) && persona.demographics.length > 0 && (
            <div><span className="font-medium">Demographics:</span> <span className="flex flex-wrap gap-2 mt-1">{persona.demographics.map((d: string, idx: number) => <span key={idx} className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">{d}</span>)}</span></div>
          )}
          {persona.pain_points && Array.isArray(persona.pain_points) && persona.pain_points.length > 0 && (
            <div><span className="font-medium">Pain Points:</span> <span className="flex flex-wrap gap-2 mt-1">{persona.pain_points.map((p: string, idx: number) => <span key={idx} className="inline-block bg-red-50 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium border border-red-200">{p}</span>)}</span></div>
          )}
          {persona.success_metrics && Array.isArray(persona.success_metrics) && persona.success_metrics.length > 0 && (
            <div><span className="font-medium">Success Metrics:</span> <span className="flex flex-wrap gap-2 mt-1">{persona.success_metrics.map((s: string, idx: number) => <span key={idx} className="inline-block bg-green-50 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">{s}</span>)}</span></div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Component for rendering opportunity items
const OpportunityItems: React.FC<{ opportunities: any[] }> = ({ opportunities }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">Sales Opportunities</div>
    {opportunities.map((op, i) => (
      <div key={i} className="opportunity-item bg-emerald-50 border-l-4 border-emerald-400 px-4 py-3 mb-3 rounded-r-lg">
        <div className="opportunity-title font-semibold text-emerald-900 mb-1">{op.segment}</div>
        <div>{op.approach}</div>
        {op.rationale && <div className="text-xs text-emerald-700 mt-1">{op.rationale}</div>}
      </div>
    ))}
  </div>
);

// Component for rendering metrics grid
const MetricsGrid: React.FC<{ metrics: any[] }> = ({ metrics }) => (
  <div className="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
    {metrics.map((metric, i) => (
      <div key={i} className="metric-card bg-sky-50 border border-sky-400 rounded-lg p-4 text-center">
        <div className="metric-value text-xl font-bold text-sky-800 mb-1">{metric.value}</div>
        <div className="metric-label text-xs text-sky-700">{metric.label}</div>
      </div>
    ))}
  </div>
);

// Component for rendering tech list
const TechList: React.FC<{ technologies: string[]; title: string }> = ({ technologies, title }) => (
  <div className="tech-category mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">{title}</div>
    <div className="tech-list flex flex-wrap gap-2">
      {technologies.map((tech, i) => (
        <div key={i} className="tech-item bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          {tech}
        </div>
      ))}
    </div>
  </div>
);

// Component for rendering integration capabilities
const IntegrationCapabilities: React.FC<{ integrations: any }> = ({ integrations }) => {
  if (!integrations || (Array.isArray(integrations) && integrations.length === 0) || (typeof integrations === 'object' && Object.keys(integrations).length === 0)) {
    return <div className="text-gray-500 italic">No integration capabilities found.</div>;
  }
  // If it's an array, render as a list
  if (Array.isArray(integrations)) {
    return (
      <ul className="list-disc pl-5">
        {integrations.map((item, i) => <li key={i}>{renderValue(item)}</li>)}
      </ul>
    );
  }
  // If it's an object, render each key as a section
  return (
    <div className="space-y-2">
      {Object.entries(integrations).map(([key, value]) => (
        <div key={key}>
          <span className="font-semibold text-blue-800">{prettifyLabel(key)}:</span>
          <ul className="list-disc pl-5">
            {Array.isArray(value) ? value.map((v, i) => <li key={i}>{renderValue(v)}</li>) : <li>{renderValue(value)}</li>}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Component for rendering platform compatibility
const PlatformCompatibility: React.FC<{ compatibility: any }> = ({ compatibility }) => {
  if (!compatibility || (Array.isArray(compatibility) && compatibility.length === 0) || (typeof compatibility === 'object' && Object.keys(compatibility).length === 0)) {
    return <div className="text-gray-500 italic">No platform compatibility info found.</div>;
  }
  // If it's an array, render as a list
  if (Array.isArray(compatibility)) {
    return (
      <ul className="list-disc pl-5">
        {compatibility.map((item, i) => <li key={i}>{renderValue(item)}</li>)}
      </ul>
    );
  }
  // If it's an object, render as a table
  return (
    <table className="min-w-full text-sm border mt-2">
      <tbody>
        {Object.entries(compatibility).map(([key, value]) => (
          <tr key={key}>
            <td className="font-semibold text-blue-800 pr-2 align-top">{prettifyLabel(key)}:</td>
            <td>{renderValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Helper to safely render any field
function renderField(field: any) {
  if (field == null) return 'N/A';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) return field.join(', ');
  if (typeof field === 'object') return JSON.stringify(field);
  return String(field);
}

// Helper to safely render unknown values as string
const renderValue = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(renderValue).join(', ');
  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
};

// Helper to render objects as structured content
const renderObject = (obj: any): string => {
  if (typeof obj !== 'object' || obj === null) return String(obj);
  if (Array.isArray(obj)) return obj.map(item => renderObject(item)).join(', ');
  return Object.entries(obj).map(([key, value]) => `${key}: ${renderObject(value)}`).join(', ');
};

// ListGrid and BulletList now use TagList
const ListGrid: React.FC<{ items: any[]; title: string }> = ({ items, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-3">{title}</div>
    <TagList items={items} />
  </div>
);
const BulletList: React.FC<{ items: any[]; title: string }> = ({ items, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-3">{title}</div>
    <TagList items={items} />
  </div>
);
// CompetitorGrid uses TagList for consistency
const CompetitorGrid: React.FC<{ competitors: any[] }> = ({ competitors }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">Direct Competitors</div>
    <TagList items={competitors} />
  </div>
);

// Main canonical report renderer
const CanonicalReportRenderer: React.FC<CanonicalReportRendererProps> = ({ reportData }) => {
  console.log('[CanonicalReportRenderer] Received reportData:', reportData);
  
  const mapping = reportMapping.canonical_report_mapping;
  
  // Parse LLM output if it's a string
  let rawData = typeof reportData.llm_output === 'string' 
    ? JSON.parse(reportData.llm_output) 
    : reportData.llm_output || reportData;
  
  console.log('[CanonicalReportRenderer] Raw parsed data:', rawData);
  console.log('[CanonicalReportRenderer] Raw data keys:', Object.keys(rawData || {}));
  
  // Transform data to handle both old nested and new flat structures
  const transformData = (raw: any) => {
    // If it's already flat (new structure), return as is
    if (raw.company_name || raw.companyName) {
      return raw;
    }
    
    // If it's nested (old structure), flatten it
    const transformed: any = {};
    
    // Extract from company_overview
    if (raw.company_overview) {
      transformed.company_name = raw.company_overview.company_name || raw.company_overview.companyName || raw.company_overview.name || '';
      transformed.company_size = raw.company_overview.company_size || raw.company_overview.size || '';
      transformed.founded = raw.company_overview.founded || raw.company_overview.founding_year || '';
      transformed.industry = Array.isArray(raw.company_overview.industry_segments) ? raw.company_overview.industry_segments[0] : (raw.company_overview.industry || raw.company_overview.industry_segments || '');
      transformed.headquarters = raw.company_overview.headquarters || raw.company_overview.location || raw.company_overview.address || raw.company_overview.hq || '';
      transformed.revenue_range = raw.company_overview.revenue || raw.company_overview.revenue_range || '';
      transformed.company_type = raw.company_overview.company_type || raw.company_overview.type || '';
      transformed.funding_status = raw.company_overview.funding_status?.status || raw.company_overview.funding_status || raw.company_overview.funding || '';
      transformed.summary = raw.company_overview.overview || raw.company_overview.summary || raw.company_overview.description || '';
      transformed.website = raw.company_overview.website || raw.company_overview.company_url || raw.company_overview.url || '';
    }
    
    // Extract from products_positioning
    if (raw.products_positioning) {
      transformed.main_products = Array.isArray(raw.products_positioning.main_products) ? raw.products_positioning.main_products : (raw.products_positioning.products || []);
      transformed.target_market = raw.products_positioning.target_market || raw.products_positioning.market || {};
      transformed.direct_competitors = raw.products_positioning.competitors ? 
        (Array.isArray(raw.products_positioning.competitors) ? raw.products_positioning.competitors : Object.values(raw.products_positioning.competitors).flat()) : 
        (raw.products_positioning.competition || []);
      transformed.key_differentiators = raw.products_positioning.key_differentiators || raw.products_positioning.differentiators || [];
      transformed.market_trends = Array.isArray(raw.products_positioning.market_trends) ? raw.products_positioning.market_trends : (raw.products_positioning.trends || []);
    }
    
    // Extract from features_ecosystem_gtm
    if (raw.features_ecosystem_gtm) {
      transformed.backend_technologies = raw.features_ecosystem_gtm.backend_technologies || raw.features_ecosystem_gtm.backend || [];
      transformed.frontend_technologies = raw.features_ecosystem_gtm.frontend_technologies || raw.features_ecosystem_gtm.frontend || [];
      transformed.infrastructure = raw.features_ecosystem_gtm.infrastructure || raw.features_ecosystem_gtm.tech_stack || [];
      transformed.key_platform_features = Array.isArray(raw.features_ecosystem_gtm.key_features) ? raw.features_ecosystem_gtm.key_features : (raw.features_ecosystem_gtm.features || []);
      transformed.integration_capabilities = raw.features_ecosystem_gtm.integrations ? 
        (Array.isArray(raw.features_ecosystem_gtm.integrations) ? raw.features_ecosystem_gtm.integrations : Object.values(raw.features_ecosystem_gtm.integrations).flat()) : 
        (raw.features_ecosystem_gtm.integration_capabilities || []);
      transformed.platform_compatibility = raw.features_ecosystem_gtm.enterprise_readiness ? 
        (Array.isArray(raw.features_ecosystem_gtm.enterprise_readiness) ? raw.features_ecosystem_gtm.enterprise_readiness : Object.values(raw.features_ecosystem_gtm.enterprise_readiness)) : 
        (raw.features_ecosystem_gtm.platform_compatibility || []);
    }
    
    // Extract from icp_and_buying
    if (raw.icp_and_buying) {
      transformed.icp = raw.icp_and_buying.icp_demographics || raw.icp_and_buying.icp || {};
      transformed.buyer_personas = Array.isArray(raw.icp_and_buying.buying_committee_personas) ? raw.icp_and_buying.buying_committee_personas : (raw.icp_and_buying.personas || []);
      transformed.sales_opportunities = raw.icp_and_buying.action_steps?.lead_scoring || raw.icp_and_buying.sales_opportunities || [];
      transformed.gtm_recommendations = raw.icp_and_buying.gtm_messaging || raw.icp_and_buying.gtm_recommendations || {};
      transformed.metrics = Array.isArray(raw.icp_and_buying.kpis_targeted) ? raw.icp_and_buying.kpis_targeted.map((kpi: string) => ({ label: kpi, value: '' })) : (raw.icp_and_buying.metrics || []);
    }
    
    // Extract from sales data (features_ecosystem_gtm contains sales info)
    if (raw.features_ecosystem_gtm) {
      transformed.notable_clients = Array.isArray(raw.features_ecosystem_gtm.client_logos) ? raw.features_ecosystem_gtm.client_logos : (raw.features_ecosystem_gtm.clients || []);
      transformed.social_media = raw.features_ecosystem_gtm.social_media || {};
    }
    
    // Also check for flat structure fields that might be at the root level
    if (!transformed.company_name && (raw.company_name || raw.companyName || raw.name)) {
      transformed.company_name = raw.company_name || raw.companyName || raw.name;
    }
    if (!transformed.headquarters && (raw.headquarters || raw.location || raw.address)) {
      transformed.headquarters = raw.headquarters || raw.location || raw.address;
    }
    if (!transformed.website && (raw.website || raw.company_url || raw.url)) {
      transformed.website = raw.website || raw.company_url || raw.url;
    }
    if (!transformed.funding_status && raw.funding_status) {
      transformed.funding_status = raw.funding_status;
    }
    
    return transformed;
  };
  
  const data = sanitizeReportData(transformData(rawData));
  
  console.log('[CanonicalReportRenderer] Transformed data:', data);
  console.log('[CanonicalReportRenderer] Transformed data keys:', Object.keys(data || {}));
  
  // Debug: Show actual values for key fields
  console.log('[CanonicalReportRenderer] Key field values:', {
    company_name: data.company_name,
    company_size: data.company_size,
    industry: data.industry,
    summary: data.summary?.substring(0, 100) + '...',
    main_products: data.main_products,
    direct_competitors: data.direct_competitors,
    buyer_personas: data.buyer_personas
  });

  // Defensive fallback for all fields
  const safeData = (key: string, fallback: any) => {
    if (data == null) return fallback;
    const val = data[key];
    if (val === undefined || val === null) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(val)) return fallback;
    if (typeof fallback === 'object' && fallback !== null && typeof val !== 'object') return fallback;
    return val;
  };

  const renderSubsection = (subsection: any, sectionData: any) => {
    const { id, type, fields } = subsection;
    
    switch (type) {
      case 'header':
        return fields.includes('company_name') && safeData('company_name', 'N/A') && (
          <CompanyHeader companyName={safeData('company_name', 'N/A')} />
        );
      case 'two_column_grid':
        if (fields.length === 2 && fields[0].column === 'left' && fields[1].column === 'right') {
          const leftFields = fields[0].fields.reduce((acc: any, field: string) => {
            acc[field] = safeData(field, 'N/A');
            return acc;
          }, {});
          const rightFields = fields[1].fields.reduce((acc: any, field: string) => {
            acc[field] = safeData(field, 'N/A');
            return acc;
          }, {});
          return (
            <TwoColumnGrid leftFields={leftFields} rightFields={rightFields} />
          );
        }
        return null;
      case 'description':
        return fields.includes('summary') && safeData('summary', '') && (
          <Description content={safeData('summary', 'N/A')} />
        );
      case 'client_list':
        return fields.includes('notable_clients') && Array.isArray(safeData('notable_clients', [])) && safeData('notable_clients', []).length > 0 && (
          <ClientList clients={safeData('notable_clients', [])} />
        );
      case 'social_links':
        return fields.includes('social_media') && safeData('social_media', {}) && Object.keys(safeData('social_media', {})).length > 0 && (
          <SocialLinks socialMedia={safeData('social_media', {})} />
        );
      case 'list_grid':
        const listField = fields[0];
        return Array.isArray(safeData(listField, [])) && safeData(listField, []).length > 0 && (
          <ListGrid items={safeData(listField, [])} title={prettifyLabel(listField)} />
        );
      case 'icp_section':
        const icpField = fields[0];
        return safeData(icpField, {}) && (
          <ICPDisplay icp={safeData(icpField, {})} />
        );
      case 'competitor_grid':
        return fields.includes('direct_competitors') && Array.isArray(safeData('direct_competitors', [])) && safeData('direct_competitors', []).length > 0 && (
          <CompetitorGrid competitors={safeData('direct_competitors', [])} />
        );
      case 'bullet_list':
        const bulletField = fields[0];
        return Array.isArray(safeData(bulletField, [])) && safeData(bulletField, []).length > 0 && (
          <BulletList items={safeData(bulletField, [])} title={prettifyLabel(bulletField)} />
        );
      case 'buyer_personas':
        return fields.includes('buyer_personas') && Array.isArray(safeData('buyer_personas', [])) && safeData('buyer_personas', []).length > 0 && (
          <BuyerPersonas personas={safeData('buyer_personas', [])} />
        );
      case 'opportunity_items':
        return fields.includes('sales_opportunities') && Array.isArray(safeData('sales_opportunities', [])) && safeData('sales_opportunities', []).length > 0 && (
          <OpportunityItems opportunities={safeData('sales_opportunities', [])} />
        );
      case 'metrics_grid':
        return fields.includes('metrics') && Array.isArray(safeData('metrics', [])) && safeData('metrics', []).length > 0 && (
          <MetricsGrid metrics={safeData('metrics', [])} />
        );
      case 'tech_list':
        const techField = fields[0];
        return Array.isArray(safeData(techField, [])) && safeData(techField, []).length > 0 && (
          <TechList technologies={safeData(techField, [])} title={prettifyLabel(techField)} />
        );
      case 'integration_capabilities':
        return fields.includes('integration_capabilities') && safeData('integration_capabilities', []) && (
          <IntegrationCapabilities integrations={safeData('integration_capabilities', [])} />
        );
      case 'platform_compatibility':
        return fields.includes('platform_compatibility') && safeData('platform_compatibility', []) && (
          <PlatformCompatibility compatibility={safeData('platform_compatibility', [])} />
        );
      default:
        return null;
    }
  };

  const renderSection = (section: any) => {
    const IconComponent = sectionIcons[section.id as keyof typeof sectionIcons];
    
    // Check if section has any data to render
    const hasData = Array.isArray(section.subsections) && section.subsections.some((subsection: any) => {
      const { fields } = subsection;
      if (subsection.type === 'two_column_grid') {
        return Array.isArray(fields) && fields.some((fieldGroup: any) => 
          fieldGroup.fields && Array.isArray(fieldGroup.fields) && fieldGroup.fields.some((field: string) => safeData(field, 'N/A'))
        );
      }
      return Array.isArray(fields) && fields.some((field: string) => safeData(field, 'N/A'));
    });

    if (!hasData) return null;

    return (
      <Card key={section.id} className="p-8 shadow-lg rounded-2xl">
        <CardHeader className="mb-4 pb-0 border-b-0">
          <div className="flex items-center gap-3 mb-2">
            {IconComponent && <IconComponent className="h-7 w-7 text-primary" />}
            <h2 className="section-title text-2xl font-bold text-gray-900 mb-0">{section.title}</h2>
          </div>
        </CardHeader>
        <CardContent>
          {section.subsections.map((subsection: any, index: number) => 
            <div key={`${section.id}-${subsection.id || index}`}>
              {renderSubsection(subsection, data)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10">
      {mapping.sections.map(renderSection)}
    </div>
  );
};

export default CanonicalReportRenderer; 