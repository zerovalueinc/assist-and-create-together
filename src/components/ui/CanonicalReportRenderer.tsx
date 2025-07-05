import React from 'react';
import ReportWrapper from './ICPReport/ReportWrapper';

interface CanonicalReportRendererProps {
  reportData: any;
}

// Main canonical report renderer - now using modular components
const CanonicalReportRenderer: React.FC<CanonicalReportRendererProps> = ({ reportData }) => {
  console.log('[CanonicalReportRenderer] Received reportData:', reportData);
  
  return <ReportWrapper reportData={reportData} />;
};

export default CanonicalReportRenderer; 