import { Button } from './button';
import { CheckCircle } from 'lucide-react';

interface CompanyReportCardProps {
  report: any;
  selected?: boolean;
  onClick?: () => void;
}

function getCompanyDomain(report: any): string {
  // First try legacy fields
  const legacyDomain = report.companyUrl || report.url || report.website || report.company_url || report.websiteUrl || '';
  if (legacyDomain) return legacyDomain;
  
  // Then try to extract from llm_output
  if (report.llm_output) {
    const llm = typeof report.llm_output === 'string' ? JSON.parse(report.llm_output) : report.llm_output;
    return llm.website || llm.company_url || llm.url || '';
  }
  
  return '';
}

function getCompanyName(report: any): string {
  // First try legacy fields
  const legacyName = report.companyName || report.company_name || report.companyname;
  if (legacyName) return legacyName;
  
  // Then try to extract from llm_output
  if (report.llm_output) {
    const llm = typeof report.llm_output === 'string' ? JSON.parse(report.llm_output) : report.llm_output;
    return llm.company_name || llm.companyName || llm.name || 'Untitled';
  }
  
  return 'Untitled';
}

export function CompanyReportCard({ report, selected, onClick }: CompanyReportCardProps) {
  const name = getCompanyName(report);
  const domain = getCompanyDomain(report);
  
  // Only show favicon if domain exists
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1 text-sm"
      size="sm"
    >
      {domain && (
        <img src={`https://www.google.com/s2/favicons?domain=${domain}`} alt="favicon" className="w-4 h-4 mr-1" />
      )}
      {name}
      {selected && <CheckCircle className="h-3 w-3 ml-1" />}
    </Button>
  );
} 