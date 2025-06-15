
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AssignmentManagement from '@/components/assignments/AssignmentManagement';

const AssignmentsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <AssignmentManagement />
      </div>
    </MainLayout>
  );
};

export default AssignmentsPage;
