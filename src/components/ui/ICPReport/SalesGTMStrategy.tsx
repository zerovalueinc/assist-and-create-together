import * as React from "react";

interface SalesGTMStrategyProps {
  data: any;
}

export default function SalesGTMStrategy({ data }: SalesGTMStrategyProps) {
  const salesOpportunities = data.sales_opportunities || data.opportunities || [];
  const gtmRecommendations = data.gtm_recommendations || data.gtm || {};
  const metrics = data.metrics || [];

  return (
    <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        🚀 Sales GTM Strategy
      </h2>
      
      {/* Sales Opportunities */}
      {salesOpportunities.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">Sales Opportunities</h3>
          <div className="space-y-3">
            {salesOpportunities.map((opportunity: any, idx: number) => (
              <div key={idx} className="bg-emerald-50 border-l-4 border-emerald-400 px-4 py-3 rounded-r-lg">
                <div className="font-semibold text-emerald-900 mb-1">
                  {opportunity.segment || opportunity.title || `Opportunity ${idx + 1}`}
                </div>
                {opportunity.approach && (
                  <div className="text-gray-700 mb-2">{opportunity.approach}</div>
                )}
                {opportunity.rationale && (
                  <div className="text-xs text-emerald-700">{opportunity.rationale}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GTM Recommendations */}
      {gtmRecommendations && Object.keys(gtmRecommendations).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">GTM Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(gtmRecommendations).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const label = key === 'vertical_specific_solutions' ? 'Vertical Solutions' :
                           key === 'partner_ecosystem' ? 'Partner Ecosystem' :
                           key === 'content_marketing' ? 'Content Marketing' :
                           key === 'sales_enablement' ? 'Sales Enablement' :
                           key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <div key={key} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-semibold text-blue-800 mb-2">{label}</div>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((v: string, idx: number) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-sm font-medium border border-blue-300">
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-blue-900">{String(value)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics */}
      {metrics.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric: any, idx: number) => (
              <div key={idx} className="bg-sky-50 border border-sky-400 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-sky-800 mb-1">
                  {metric.value || metric.metric || 'N/A'}
                </div>
                <div className="text-xs text-sky-700">
                  {metric.label || metric.name || `Metric ${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {salesOpportunities.length === 0 && (!gtmRecommendations || Object.keys(gtmRecommendations).length === 0) && metrics.length === 0 && (
        <div className="text-gray-500 italic text-center py-8">
          No sales or GTM strategy data available.
        </div>
      )}
    </section>
  );
} 