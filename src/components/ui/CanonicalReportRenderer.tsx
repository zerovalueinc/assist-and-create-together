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
  <div className="company-details grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
    <div>
      {Object.entries(leftFields).map(([key, value]) => (
        value && (
          <div key={key} className="detail-group mb-3">
            <div className="detail-label">{prettifyLabel(key)}</div>
            <div className="detail-value">{String(value)}</div>
          </div>
        )
      ))}
    </div>
    <div>
      {Object.entries(rightFields).map(([key, value]) => (
        value && (
          <div key={key} className="detail-group mb-3">
            <div className="detail-label">{prettifyLabel(key)}</div>
            <div className="detail-value">{String(value)}</div>
          </div>
        )
      ))}
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
const ClientList: React.FC<{ clients: string[] }> = ({ clients }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">Notable Clients</div>
    <div className="notable-clients flex flex-wrap gap-3">
      {clients.map((client, i) => (
        <span key={i} className="client-item bg-orange-50 border border-orange-300 px-4 py-2 rounded-full text-sm font-medium">
          {client}
        </span>
      ))}
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
const ListGrid: React.FC<{ items: string[]; title: string }> = ({ items, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">{title}</div>
    <div className="list-grid grid grid-cols-2 gap-2">
      {items.map((item, i) => (
        <div key={i} className="list-item bg-gray-50 border-l-4 border-indigo-500 px-3 py-2 rounded text-sm font-medium">
          {item}
        </div>
      ))}
    </div>
  </div>
);

// Component for rendering ICP section
const ICPSection: React.FC<{ data: any; title: string }> = ({ data, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">{title}</div>
    <div className="icp-section bg-green-50 border border-green-400 rounded-lg p-4">
      {data.primary && <div><strong>Primary:</strong> {data.primary}</div>}
      {data.size_range && <div className="mt-2"><strong>Size Range:</strong> {data.size_range}</div>}
      {data.industry_focus && (
        <div className="mt-2">
          <strong>Industry Focus:</strong> {Array.isArray(data.industry_focus) ? data.industry_focus.join(', ') : data.industry_focus}
        </div>
      )}
      {data.company_characteristics && (
        <div className="mt-4">
          <strong>Company Characteristics:</strong>
          <ul className="list-disc pl-5 mt-2">
            {Object.entries(data.company_characteristics).map(([key, value]) => (
              <li key={key}>{prettifyLabel(key)}: {String(value)}</li>
            ))}
          </ul>
        </div>
      )}
      {data.technology_profile && (
        <div className="mt-4">
          <strong>Technology Profile:</strong>
          <ul className="list-disc pl-5 mt-2">
            {Object.entries(data.technology_profile).map(([key, value]) => (
              <li key={key}>{prettifyLabel(key)}: {String(value)}</li>
            ))}
          </ul>
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
const BulletList: React.FC<{ items: string[]; title: string }> = ({ items, title }) => (
  <div className="subsection mb-6">
    <div className="subsection-title font-semibold text-lg mb-2">{title}</div>
    <ul className="list-disc pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
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

// Main canonical report renderer
const CanonicalReportRenderer: React.FC<CanonicalReportRendererProps> = ({ reportData }) => {
  const mapping = reportMapping.canonical_report_mapping;
  
  // Parse LLM output if it's a string
  const data = typeof reportData.llm_output === 'string' 
    ? JSON.parse(reportData.llm_output) 
    : reportData.llm_output || reportData;

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
          {section.subsections.map((subsection: any) => 
            renderSubsection(subsection, data)
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