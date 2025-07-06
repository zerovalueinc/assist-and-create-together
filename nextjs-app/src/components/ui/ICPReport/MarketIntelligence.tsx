import React from 'react';

interface MarketIntelligenceProps {
  data: any;
}

export default function MarketIntelligence({ data }: MarketIntelligenceProps) {
  const mainProducts = data.main_products || data.products || [];
  const targetMarket = data.target_market || data.market || {};
  const competitors = data.direct_competitors || data.competitors || [];
  const differentiators = data.key_differentiators || data.differentiators || [];
  const trends = data.market_trends || data.trends || [];

  return (
    <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        📊 Market Intelligence
      </h2>
      
      {/* Main Products */}
      {mainProducts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Main Products</h3>
          <div className="flex flex-wrap gap-2">
            {mainProducts.map((product: string, idx: number) => (
              <span key={idx} className="inline-block bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target Market */}
      {targetMarket && Object.keys(targetMarket).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Target Market</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(targetMarket).map(([key, value]) => (
              <div key={key}>
                <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong>
                <div className="mt-1">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1">
                      {value.map((v: string, idx: number) => (
                        <span key={idx} className="inline-block bg-green-50 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-700">{String(value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct Competitors */}
      {competitors.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Direct Competitors</h3>
          <div className="flex flex-wrap gap-2">
            {competitors.map((competitor: string, idx: number) => (
              <span key={idx} className="inline-block bg-red-50 text-red-800 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                {competitor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Differentiators */}
      {differentiators.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Key Differentiators</h3>
          <div className="flex flex-wrap gap-2">
            {differentiators.map((diff: string, idx: number) => (
              <span key={idx} className="inline-block bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-medium border border-purple-200">
                {diff}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Market Trends */}
      {trends.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Market Trends</h3>
          <div className="flex flex-wrap gap-2">
            {trends.map((trend: string, idx: number) => (
              <span key={idx} className="inline-block bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                {trend}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 