import React from 'react';
import ExecutiveSummary from "./ExecutiveSummary";
import CompanyOverview from "./CompanyOverview";
import MarketIntelligence from "./MarketIntelligence";
import ICPIBPFramework from "./ICPIBPFramework";
import SalesGTMStrategy from "./SalesGTMStrategy";
import TechnologyStack from "./TechnologyStack";

interface ReportWrapperProps {
  reportData: any;
}

export default function ReportWrapper({ reportData }: ReportWrapperProps) {
  // Parse LLM output if it's a string
  let data = typeof reportData.llm_output === 'string' 
    ? JSON.parse(reportData.llm_output) 
    : reportData.llm_output || reportData;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <ExecutiveSummary data={data} />
      <CompanyOverview data={data} />
      <MarketIntelligence data={data} />
      <ICPIBPFramework data={data} />
      <SalesGTMStrategy data={data} />
      <TechnologyStack data={data} />
    </div>
  );
} 