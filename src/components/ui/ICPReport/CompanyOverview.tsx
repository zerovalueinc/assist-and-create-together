import * as React from "react";
import { renderValue } from './renderValue';

interface CompanyOverviewProps {
  data: any;
}

export default function CompanyOverview({ data }: CompanyOverviewProps) {
  return (
    <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        🏢 Company Overview
      </h2>
      {/* Company Header */}
      <div className="text-xl font-semibold mb-2">{data.company_name || 'Unknown Company'}</div>
      {/* Company Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div><strong>Size:</strong> {renderValue(data.company_size)}</div>
          <div><strong>Founded:</strong> {renderValue(data.founded)}</div>
          <div><strong>Industry:</strong> {renderValue(data.industry)}</div>
          <div><strong>Headquarters:</strong> {renderValue(data.headquarters)}</div>
        </div>
        <div className="space-y-2">
          <div><strong>Revenue:</strong> {renderValue(data.revenue_range)}</div>
          <div><strong>Type:</strong> {renderValue(data.company_type)}</div>
          <div><strong>Funding:</strong> {renderValue(data.funding_status)}</div>
        </div>
      </div>
      {/* Company Summary */}
      {data.summary && (
        <div className="mt-4">
          <strong>Summary:</strong>
          <div>{renderValue(data.summary)}</div>
        </div>
      )}
      {/* Notable Clients */}
      {data.notable_clients && Array.isArray(data.notable_clients) && data.notable_clients.length > 0 && (
        <div className="mt-4">
          <strong>Notable Clients:</strong>
          <div>{renderValue(data.notable_clients)}</div>
        </div>
      )}
      {/* Social Media */}
      {data.social_media && Object.keys(data.social_media).length > 0 && (
        <div className="mt-4">
          <strong>Social Media:</strong>
          <div>{renderValue(data.social_media)}</div>
        </div>
      )}
    </section>
  );
} 