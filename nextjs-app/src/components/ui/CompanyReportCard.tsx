import { Button } from './button';
import { CheckCircle } from 'lucide-react';

interface CompanyReportCardProps {
  report: any;
  selected?: boolean;
  onClick?: () => void;
}

function getCompanyDomain(report: any): string {
  // Use canonical structure only
  return report.company_overview?.website || report.website || report.company_url || '';
}

function getCompanyName(report: any): string {
  return (
    report.companyName ||
    report.company_name ||
    (report.overview && report.overview.company_name) ||
    (report.intel && report.intel.company_name) ||
    report.company_overview?.company_name ||
    report.name ||
    'Untitled'
  );
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