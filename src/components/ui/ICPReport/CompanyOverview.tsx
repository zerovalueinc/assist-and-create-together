import React from 'react';

interface CompanyOverviewProps {
  data: any;
}

export default function CompanyOverview({ data }: CompanyOverviewProps) {
  const company = {
    name: data.company_name || data.companyName || data.name || 'Unknown',
    size: data.company_size || data.size || 'Unknown',
    founded: data.founded || data.founding_year || 'Unknown',
    industry: data.industry || 'Unknown',
    headquarters: data.headquarters || data.location || data.address || 'Unknown',
    revenue: data.revenue_range || data.revenue || 'Unknown',
    type: data.company_type || data.type || 'Unknown',
    funding: data.funding_status || data.funding || 'Unknown',
    website: data.website || data.company_url || data.url || ''
  };

  const hasNotableClients = data.notable_clients && Array.isArray(data.notable_clients) && data.notable_clients.length > 0;
  const hasSocialMedia = data.social_media && Object.keys(data.social_media).length > 0;

  return (
    <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        🏢 Company Overview
      </h2>
      
      {/* Company Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Company Details</h3>
          <div className="space-y-2">
            <div><strong>Size:</strong> {company.size}</div>
            <div><strong>Founded:</strong> {company.founded}</div>
            <div><strong>Industry:</strong> {company.industry}</div>
            <div><strong>Headquarters:</strong> {company.headquarters}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Business Details</h3>
          <div className="space-y-2">
            <div><strong>Revenue:</strong> {company.revenue}</div>
            <div><strong>Type:</strong> {company.type}</div>
            <div><strong>Funding:</strong> {company.funding}</div>
            {company.website && (
              <div>
                <strong>Website:</strong> 
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notable Clients */}
      {hasNotableClients && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Notable Clients</h3>
          <div className="flex flex-wrap gap-2">
            {data.notable_clients.map((client: any, idx: number) => (
              <span key={idx} className="inline-block bg-orange-50 text-orange-800 px-3 py-1 rounded-full text-sm font-medium border border-orange-200">
                {typeof client === 'string' ? client : (client.name || client.company || 'Unknown Client')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Media */}
      {hasSocialMedia && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Social Media</h3>
          <div className="flex gap-4">
            {data.social_media.twitter && (
              <a href={data.social_media.twitter} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            )}
            {data.social_media.linkedin && (
              <a href={data.social_media.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {data.social_media.facebook && (
              <a href={data.social_media.facebook} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
} 