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

// Component for rendering list grid
const ListGrid: React.FC<{ items: any[]; title: string }> = ({ items, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-3">{title}</div>
    <div className="list-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div key={i} className="list-item bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="item-content text-blue-900">
            {typeof item === 'string' ? item : renderValue(item)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Component for rendering ICP section
const ICPSection: React.FC<{ data: any; title: string }> = ({ data, title }) => (
  <div className="icp-section mb-6">
    <div className="subsection-title font-semibold text-lg mb-3">{title}</div>
    <div className="icp-content space-y-4">
      {data.company_characteristics && (
        <div className="characteristics-section">
          <div className="section-subtitle font-medium text-gray-800 mb-2">Company Characteristics</div>
          <div className="characteristics-grid grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(data.company_characteristics).map(([key, value]) => (
              <div key={`char-${key}`} className="characteristic-item bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="characteristic-label font-medium text-blue-900 mb-1">{prettifyLabel(key)}</div>
                <div className="characteristic-value text-blue-800">{renderValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.technology_profile && (
        <div className="tech-profile-section">
          <div className="section-subtitle font-medium text-gray-800 mb-2">Technology Profile</div>
          <div className="tech-profile-grid grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(data.technology_profile).map(([key, value]) => (
              <div key={`tech-${key}`} className="tech-item bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="tech-label font-medium text-green-900 mb-1">{prettifyLabel(key)}</div>
                <div className="tech-value text-green-800">{renderValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Component for rendering competitor grid
const CompetitorGrid: React.FC<{ competitors: any[] }> = ({ competitors }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">Direct Competitors</div>
    <div className="competitor-grid grid grid-cols-2 gap-2">
      {competitors.map((comp, i) => (
        <div key={i} className="competitor-item bg-yellow-50 border border-yellow-400 px-3 py-2 rounded text-center font-medium">
          {typeof comp === 'string' ? comp : (comp as any).name || JSON.stringify(comp)}
        </div>
      ))}
    </div>
  </div>
);

// Component for rendering bullet list
const BulletList: React.FC<{ items: any[]; title: string }> = ({ items, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-3">{title}</div>
    <ul className="bullet-list space-y-2">
      {items.map((item, i) => (
        <li key={i} className="bullet-item flex items-start">
          <span className="bullet-point text-blue-500 mr-2 mt-1">•</span>
          <span className="bullet-content text-gray-700">
            {typeof item === 'string' ? item : renderValue(item)}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

// Component for rendering buyer personas
const BuyerPersonas: React.FC<{ personas: any[] }> = ({ personas }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">Buyer Personas</div>
    {personas.map((persona, i) => (
      <div key={i} className="buyer-persona bg-purple-50 border border-purple-400 rounded-lg p-4 mb-3">
        <div className="persona-title font-semibold text-purple-900 mb-2">{persona.title}</div>
        {persona.demographics && <div><strong>Demographics:</strong> {persona.demographics}</div>}
        {persona.pain_points && <div className="mt-1"><strong>Pain Points:</strong> {persona.pain_points}</div>}
        {persona.success_metrics && <div className="mt-1"><strong>Success Metrics:</strong> {persona.success_metrics}</div>}
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
      transformed.company_name = raw.company_overview.company_name || raw.company_overview.companyName || '';
      transformed.company_size = raw.company_overview.company_size || '';
      transformed.founded = raw.company_overview.founded || '';
      transformed.industry = Array.isArray(raw.company_overview.industry_segments) ? raw.company_overview.industry_segments[0] : (raw.company_overview.industry || '');
      transformed.headquarters = raw.company_overview.headquarters || '';
      transformed.revenue_range = raw.company_overview.revenue || '';
      transformed.company_type = raw.company_overview.funding_status?.status || raw.company_overview.funding_status || '';
      transformed.summary = raw.company_overview.overview || '';
      transformed.website = raw.company_overview.website || '';
    }
    
    // Extract from products_positioning
    if (raw.products_positioning) {
      transformed.main_products = Array.isArray(raw.products_positioning.main_products) ? raw.products_positioning.main_products : [];
      transformed.target_market = raw.products_positioning.target_market || {};
      transformed.direct_competitors = raw.products_positioning.competitors ? Object.values(raw.products_positioning.competitors).flat() : [];
      transformed.key_differentiators = raw.products_positioning.key_differentiators || [];
      transformed.market_trends = Array.isArray(raw.products_positioning.market_trends) ? raw.products_positioning.market_trends : [];
    }
    
    // Extract from features_ecosystem_gtm
    if (raw.features_ecosystem_gtm) {
      transformed.backend_technologies = raw.features_ecosystem_gtm.backend_technologies || [];
      transformed.frontend_technologies = raw.features_ecosystem_gtm.frontend_technologies || [];
      transformed.infrastructure = raw.features_ecosystem_gtm.infrastructure || [];
      transformed.key_platform_features = Array.isArray(raw.features_ecosystem_gtm.key_features) ? raw.features_ecosystem_gtm.key_features : [];
      transformed.integration_capabilities = raw.features_ecosystem_gtm.integrations ? Object.values(raw.features_ecosystem_gtm.integrations).flat() : [];
      transformed.platform_compatibility = raw.features_ecosystem_gtm.enterprise_readiness ? Object.values(raw.features_ecosystem_gtm.enterprise_readiness) : [];
    }
    
    // Extract from icp_and_buying
    if (raw.icp_and_buying) {
      transformed.icp = raw.icp_and_buying.icp_demographics || {};
      transformed.buyer_personas = Array.isArray(raw.icp_and_buying.buying_committee_personas) ? raw.icp_and_buying.buying_committee_personas : [];
      transformed.sales_opportunities = raw.icp_and_buying.action_steps?.lead_scoring || [];
      transformed.gtm_recommendations = raw.icp_and_buying.gtm_messaging || {};
      transformed.metrics = Array.isArray(raw.icp_and_buying.kpis_targeted) ? raw.icp_and_buying.kpis_targeted.map((kpi: string) => ({ label: kpi, value: '' })) : [];
    }
    
    // Extract from sales data (features_ecosystem_gtm contains sales info)
    if (raw.features_ecosystem_gtm) {
      transformed.notable_clients = Array.isArray(raw.features_ecosystem_gtm.client_logos) ? raw.features_ecosystem_gtm.client_logos : [];
      transformed.social_media = raw.features_ecosystem_gtm.social_media || {};
    }
    
    return transformed;
  };
  
  const data = transformData(rawData);
  
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
          <ICPSection data={safeData(icpField, {})} title={prettifyLabel(icpField)} />
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