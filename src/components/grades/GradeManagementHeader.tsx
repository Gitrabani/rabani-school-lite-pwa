
import React from 'react';

interface GradeManagementHeaderProps {
  title: string;
}

const GradeManagementHeader: React.FC<GradeManagementHeaderProps> = ({ title }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
};

export default GradeManagementHeader;
