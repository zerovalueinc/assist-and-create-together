import React from 'react';

interface ICPIBPFrameworkProps {
  data: any;
}

export default function ICPIBPFramework({ data }: ICPIBPFrameworkProps) {
  const icp = data.icp || data.icp_demographics || {};
  const buyerPersonas = data.buyer_personas || data.personas || [];

  return (
    <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        👥 Ideal Customer & Buyer Profiles
      </h2>
      
      {/* Ideal Customer Profile */}
      {icp && Object.keys(icp).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">Ideal Customer Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(icp).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const label = key === 'company_characteristics' ? 'Company Characteristics' : 
                           key === 'technology_profile' ? 'Technology Profile' : 
                           key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-2">{label}</div>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((v: string, idx: number) => (
                        <span key={idx} className="inline-block bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-sm font-medium border border-blue-200">
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-900">{String(value)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Buyer Personas */}
      {buyerPersonas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">Buyer Personas</h3>
          <div className="space-y-4">
            {buyerPersonas.map((persona: any, idx: number) => (
              <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="font-semibold text-purple-900 mb-3 text-lg">
                  {persona.title || persona.role || `Persona ${idx + 1}`}
                </div>
                
                <div className="space-y-3">
                  {/* Demographics */}
                  {persona.demographics && Array.isArray(persona.demographics) && persona.demographics.length > 0 && (
                    <div>
                      <span className="font-medium text-purple-800">Demographics:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {persona.demographics.map((d: string, dIdx: number) => (
                          <span key={dIdx} className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pain Points */}
                  {persona.pain_points && Array.isArray(persona.pain_points) && persona.pain_points.length > 0 && (
                    <div>
                      <span className="font-medium text-purple-800">Pain Points:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {persona.pain_points.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="inline-block bg-red-50 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium border border-red-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Metrics */}
                  {persona.success_metrics && Array.isArray(persona.success_metrics) && persona.success_metrics.length > 0 && (
                    <div>
                      <span className="font-medium text-purple-800">Success Metrics:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {persona.success_metrics.map((s: string, sIdx: number) => (
                          <span key={sIdx} className="inline-block bg-green-50 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!icp || Object.keys(icp).length === 0) && buyerPersonas.length === 0 && (
        <div className="text-gray-500 italic text-center py-8">
          No ICP or Buyer Persona data available.
        </div>
      )}
    </section>
  );
} 