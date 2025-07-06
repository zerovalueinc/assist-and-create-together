import * as React from "react";

interface TechnologyStackProps {
  data: any;
}

export default function TechnologyStack({ data }: TechnologyStackProps) {
  const backendTech = data.backend_technologies || data.backend || [];
  const frontendTech = data.frontend_technologies || data.frontend || [];
  const infrastructure = data.infrastructure || data.tech_stack || [];
  const platformFeatures = data.key_platform_features || data.features || [];
  const integrations = data.integration_capabilities || data.integrations || [];
  const compatibility = data.platform_compatibility || data.enterprise_readiness || [];

  const renderTechList = (items: any[], title: string, colorClass: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item: string, idx: number) => (
            <span key={idx} className={`inline-block ${colorClass} px-3 py-1 rounded-full text-sm font-medium border`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        🧱 Technology Stack
      </h2>
      
      <div className="space-y-6">
        {/* Backend Technologies */}
        {renderTechList(backendTech, 'Backend Technologies', 'bg-purple-50 text-purple-800 border-purple-200')}
        
        {/* Frontend Technologies */}
        {renderTechList(frontendTech, 'Frontend Technologies', 'bg-blue-50 text-blue-800 border-blue-200')}
        
        {/* Infrastructure */}
        {renderTechList(infrastructure, 'Infrastructure', 'bg-green-50 text-green-800 border-green-200')}
        
        {/* Key Platform Features */}
        {renderTechList(platformFeatures, 'Key Platform Features', 'bg-yellow-50 text-yellow-800 border-yellow-200')}
        
        {/* Integration Capabilities */}
        {renderTechList(integrations, 'Integration Capabilities', 'bg-indigo-50 text-indigo-800 border-indigo-200')}
        
        {/* Platform Compatibility */}
        {renderTechList(compatibility, 'Platform Compatibility', 'bg-pink-50 text-pink-800 border-pink-200')}
      </div>

      {backendTech.length === 0 && frontendTech.length === 0 && infrastructure.length === 0 && 
       platformFeatures.length === 0 && integrations.length === 0 && compatibility.length === 0 && (
        <div className="text-gray-500 italic text-center py-8">
          No technology stack data available.
        </div>
      )}
    </section>
  );
} 