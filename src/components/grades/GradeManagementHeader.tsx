
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileUp } from 'lucide-react';

interface GradeManagementHeaderProps {
  title: string;
}

const GradeManagementHeader: React.FC<GradeManagementHeaderProps> = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import Grades
        </Button>
        <Button variant="outline" size="sm">
          <FileUp className="h-4 w-4 mr-2" />
          Bulk Upload Reports
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default GradeManagementHeader;
