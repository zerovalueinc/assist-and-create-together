import React from 'react';
import ReportWrapper from './ICPReport/ReportWrapper';

interface CanonicalReportRendererProps {
  reportData: any;
}

// Helper to extract and normalize canonical report data
function extractCanonicalData(reportData: any): any {
  if (!reportData) return {};
  
  // If reportData has llm_output, extract the canonical structure
  if (reportData.llm_output) {
    let canonical = reportData.llm_output;
    if (typeof canonical === 'string') {
      try {
        canonical = JSON.parse(canonical);
      } catch (e) {
        console.error('[CanonicalReportRenderer] Failed to parse llm_output:', e);
        return reportData;
      }
    }
    return canonical;
  }
  
  // If reportData has merged field, use that
  if (reportData.merged) {
    return reportData.merged;
  }
  
  // Otherwise, assume reportData is already the canonical structure
  return reportData;
}

// Main canonical report renderer - now using modular components
const CanonicalReportRenderer: React.FC<CanonicalReportRendererProps> = ({ reportData }) => {
  console.log('[CanonicalReportRenderer] Received reportData:', reportData);
  
  const canonicalData = extractCanonicalData(reportData);
  console.log('[CanonicalReportRenderer] Extracted canonical data:', canonicalData);
  
  return <ReportWrapper reportData={canonicalData} />;
};

export default CanonicalReportRenderer; 