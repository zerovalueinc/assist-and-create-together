import { Button } from './button';
import { CheckCircle } from 'lucide-react';

interface CompanyReportCardProps {
  report: any;
  selected?: boolean;
  onClick?: () => void;
}

function getCompanyDomain(report: any): string {
  // Try all possible fields for a company domain
  return (
    report.companyUrl ||
    report.url ||
    report.website ||
    report.company_url ||
    report.websiteUrl ||
    ''
  );
}

export function CompanyReportCard({ report, selected, onClick }: CompanyReportCardProps) {
  const name = report.companyName || report.company_name || report.companyname || 'Untitled';
  const domain = getCompanyDomain(report);
  // Only show favicon if domain exists
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
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