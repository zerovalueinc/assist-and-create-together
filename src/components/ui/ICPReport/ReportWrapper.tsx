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
  
  if (Array.isArray(val)) {
    if (val.length === 0) return 'None';
    if (typeof val[0] === 'object') {
      // Handle array of objects (like buyer personas)
      return val.map((item, index) => {
        if (item.role) {
          return `${item.role}${item.responsibilities ? ` (${item.responsibilities.join(', ')})` : ''}`;
        }
        if (item.type) {
          return `${item.type}${item.characteristics ? ` (${item.characteristics.join(', ')})` : ''}`;
        }
        return JSON.stringify(item);
      }).join('; ');
    }
    return val.join(', ');
  }
  
  if (typeof val === 'object') {
    if (val.external && val.internal) {
      // Handle influencer mapping structure
      return `External: ${val.external.join(', ')}; Internal: ${val.internal.join(', ')}`;
    }
    return JSON.stringify(val);
  }
  
  return String(val);
}

const ReportWrapper: React.FC<ReportWrapperProps> = ({ reportData }) => {
  if (!reportData) {
    return <div>No report data available</div>;
  }

  return (
    <div className="space-y-6">
      {reportWireframe.map((section, index) => {
        return (
          <Card key={index} className="w-full">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Field</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(section.fields).map(([label, path]) => {
                    const value = getValueByPath(reportData, path as string);
                    
                    return (
                      <TableRow key={label}>
                        <TableCell className="font-medium">{label}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{renderValue(value)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReportWrapper; 