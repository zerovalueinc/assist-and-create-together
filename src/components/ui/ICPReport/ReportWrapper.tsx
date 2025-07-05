import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import reportWireframe from './reportWireframe';

interface ReportWrapperProps {
  reportData: any;
}

// Helper to resolve dot-notated paths in an object
function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

// Helper to render any value safely
function renderValue(val: any): string {
  if (val == null) return 'N/A';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(renderValue).join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

const ReportWrapper: React.FC<ReportWrapperProps> = ({ reportData }) => {
  if (!reportData) return <div>No report data available.</div>;
  return (
    <div className="space-y-6">
      {reportWireframe.map((section, idx) => (
        <Card key={idx} className="">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.description && <CardDescription>{section.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(section.fields).map(([label, path]) => (
                  <TableRow key={label}>
                    <TableHead className="w-1/3 font-semibold">{label}</TableHead>
                    <TableCell>{renderValue(getValueByPath(reportData, path as string))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportWrapper; 