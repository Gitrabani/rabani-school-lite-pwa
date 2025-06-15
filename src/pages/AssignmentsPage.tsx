
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AssignmentManagement from '@/components/assignments/AssignmentManagement';

const AssignmentsPage: React.FC = () => {
  return (
    <MainLayout>
      <div>
        <AssignmentManagement />
      </div>
    </MainLayout>
  );
};

export default AssignmentsPage;
