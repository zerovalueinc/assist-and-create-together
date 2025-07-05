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
function renderValue(val: any, fieldName?: string): string {
  if (val == null) return 'N/A';
  
  if (Array.isArray(val)) {
    if (val.length === 0) return 'None';
    if (typeof val[0] === 'object') {
      // Handle array of objects (like buyer personas, key contacts)
      return val.map((item, index) => {
        if (item.role) {
          return `${item.role}${item.responsibilities ? ` (${Array.isArray(item.responsibilities) ? item.responsibilities.join(', ') : item.responsibilities})` : ''}`;
        }
        if (item.type) {
          return `${item.type}${item.characteristics ? ` (${Array.isArray(item.characteristics) ? item.characteristics.join(', ') : item.characteristics})` : ''}`;
        }
        if (item.name && item.title) {
          return `${item.name} - ${item.title}`;
        }
        return JSON.stringify(item);
      }).join('; ');
    }
    return val.join(', ');
  }
  
  if (typeof val === 'object') {
    // Handle specific object types
    if (val.external && val.internal) {
      // Handle influencer mapping structure
      return `External: ${Array.isArray(val.external) ? val.external.join(', ') : val.external}; Internal: ${Array.isArray(val.internal) ? val.internal.join(', ') : val.internal}`;
    }
    if (val.ideal && val.range) {
      // Handle revenue object
      return `Ideal: ${val.ideal}, Range: ${val.range}`;
    }
    if (val.growth_stage && val.business_model) {
      // Handle firmographics object
      return `Growth Stage: ${Array.isArray(val.growth_stage) ? val.growth_stage.join(', ') : val.growth_stage}, Business Model: ${Array.isArray(val.business_model) ? val.business_model.join(', ') : val.business_model}, Sales Channels: ${Array.isArray(val.sales_channels) ? val.sales_channels.join(', ') : val.sales_channels}, Decision Making: ${val.decision_making}`;
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
                        <TableCell className="whitespace-pre-wrap">{renderValue(value, label)}</TableCell>
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