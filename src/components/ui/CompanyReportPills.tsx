import * as React from "react";
import { CompanyReportCard } from './CompanyReportCard';

interface CompanyReportPillsProps {
  reports: any[];
  selectedId: string | null;
  onSelect: (report: any) => void;
}

export const CompanyReportPills: React.FC<CompanyReportPillsProps> = ({ reports, selectedId, onSelect }) => {
  if (!reports.length) {
    return <p className="text-gray-500 mt-2">No companies analyzed yet. Use Company Analyzer first.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {reports.map((report) => (
        <CompanyReportCard
          key={report.id}
          report={report}
          selected={selectedId === report.id}
          onClick={() => onSelect(report)}
        />
      ))}
    </div>
  );
}; 