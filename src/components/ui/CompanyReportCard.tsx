import { Button } from './button';
import { CheckCircle } from 'lucide-react';

interface CompanyReportCardProps {
  report: any;
  selected?: boolean;
  onClick?: () => void;
}

export function CompanyReportCard({ report, selected, onClick }: CompanyReportCardProps) {
  const name = report.companyName || report.company_name || report.companyname || 'Untitled';
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${report.companyUrl || report.url || report.company_url || ''}`;
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1 text-sm"
      size="sm"
    >
      <img src={faviconUrl} alt="favicon" className="w-4 h-4 mr-1" onError={e => { e.currentTarget.src = '/favicon.ico'; }} />
      {name}
      {selected && <CheckCircle className="h-3 w-3 ml-1" />}
    </Button>
  );
} 