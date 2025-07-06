import React from 'react';

interface ExecutiveSummaryProps {
  data: any;
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const companyName = data.company_name || data.companyName || data.name || 'Unknown Company';
  const industry = data.industry || 'Unknown Industry';
  const summary = data.summary || data.overview || data.description || '';

  return (
    <section className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        🧠 Executive Summary
      </h2>
      <div className="space-y-3">
        <p><strong>Company:</strong> {companyName}</p>
        <p><strong>Industry:</strong> {industry}</p>
        {summary && (
          <div>
            <strong>Overview:</strong>
            <p className="mt-1 text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </section>
  );
} 