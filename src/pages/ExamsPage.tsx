
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ExamManagement from '@/components/exams/ExamManagement';

const ExamsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.role !== 'admin' && user.role !== 'teacher') {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Exam management is not available for your role.
        </p>
      </div>
    );
  }

  return <ExamManagement />;
};

export default ExamsPage;
