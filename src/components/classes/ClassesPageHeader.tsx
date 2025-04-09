
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';

interface ClassesPageHeaderProps {
  canAddClass: boolean;
  onAddClass: () => void;
}

const ClassesPageHeader: React.FC<ClassesPageHeaderProps> = ({ canAddClass, onAddClass }) => {
  return (
    <PageHeader 
      title="Classes" 
      description="Manage and view classes" 
      actions={
        canAddClass ? (
          <Button onClick={onAddClass}>
            <Plus className="mr-2 h-4 w-4" /> Add Class
          </Button>
        ) : undefined
      }
    />
  );
};

export default ClassesPageHeader;
