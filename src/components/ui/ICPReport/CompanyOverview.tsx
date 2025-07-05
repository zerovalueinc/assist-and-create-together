import React from 'react';
import { renderValue } from './ReportWrapper';

interface CompanyOverviewProps {
  data: any;
}

export default function CompanyOverview({ data }: CompanyOverviewProps) {
  const company = {
    name: data.name || data.company_name || data.companyName || 'Unknown',
    size: data.size || 'Unknown',
    founded: data.founded || 'Unknown',
    industry: data.industry || 'Unknown',
    headquarters: data.headquarters || 'Unknown',
    revenue: data.revenue || 'Unknown',
    type: data.type || 'Unknown',
    funding: data.funding || 'Unknown',
    website: data.website || ''
  };

  const hasNotableClients = data.notableClients && Array.isArray(data.notableClients) && data.notableClients.length > 0;
  const hasSocialMedia = data.socialMedia && Object.keys(data.socialMedia).length > 0;
  const hasKeyContacts = data.keyContacts && data.keyContacts.length > 0;
  const hasEmployeesKeyRegions = data.employeesKeyRegions && data.employeesKeyRegions.length > 0;

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
            <div><strong>Size:</strong> {renderValue(company.size)}</div>
            <div><strong>Founded:</strong> {renderValue(company.founded)}</div>
            <div><strong>Industry:</strong> {renderValue(company.industry)}</div>
            <div><strong>Headquarters:</strong> {renderValue(company.headquarters)}</div>
            {hasEmployeesKeyRegions && <div><strong>Employees by Region:</strong> {renderValue(data.employeesKeyRegions)}</div>}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Business Details</h3>
          <div className="space-y-2">
            <div><strong>Revenue:</strong> {renderValue(company.revenue)}</div>
            <div><strong>Type:</strong> {renderValue(company.type)}</div>
            <div><strong>Funding:</strong> {renderValue(company.funding)}</div>
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
          <div>{renderValue(data.notableClients)}</div>
        </div>
      )}

      {/* Key Contacts */}
      {hasKeyContacts && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Key Contacts</h3>
          <div>{renderValue(data.keyContacts)}</div>
        </div>
      )}

      {/* Social Media */}
      {hasSocialMedia && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Social Media</h3>
          <div>{renderValue(data.socialMedia)}</div>
        </div>
      )}
    </section>
  );
} 