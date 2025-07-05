import React from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import CompanyOverview from './CompanyOverview';
import MarketIntelligence from './MarketIntelligence';
import ICPIBPFramework from './ICPIBPFramework';
import SalesGTMStrategy from './SalesGTMStrategy';
import TechnologyStack from './TechnologyStack';

interface ReportWrapperProps {
  reportData: any;
}

export default function ReportWrapper({ reportData }: ReportWrapperProps) {
  // Parse LLM output if it's a string
  let data = typeof reportData.llm_output === 'string' 
    ? JSON.parse(reportData.llm_output) 
    : reportData.llm_output || reportData;

  // If the modular structure exists, use it; otherwise, fallback to flat
  const modular = data.merged || data;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <ExecutiveSummary data={modular.executiveSummary || modular} />
      <CompanyOverview data={modular.companyOverview || modular} />
      <MarketIntelligence data={modular.marketIntelligence || modular} />
      <ICPIBPFramework data={modular.icpIbps || modular} />
      <SalesGTMStrategy data={modular.salesGtmStrategy || modular} />
      <TechnologyStack data={modular.technologyStack || modular} />
    </div>
  );
} 