
import React from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import PageHeader from '../components/shared/PageHeader';
import StudentGradeView from '@/components/grades/StudentGradeView';
import TeacherGradeView from '@/components/grades/TeacherGradeView';
import ParentGradeView from '@/components/grades/ParentGradeView';

const GradesPage: React.FC = () => {
  const { user } = useAuth();

  const renderGradeView = () => {
    switch (user?.role) {
      case 'student':
        return <StudentGradeView />;
      case 'teacher':
        return <TeacherGradeView />;
      case 'parent':
        return <ParentGradeView />;
      default:
        return <StudentGradeView />;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Grades" 
        description={
          user?.role === 'teacher' ? "Manage student grades" : 
          user?.role === 'parent' ? "View your children's grades" :
          "View grade records"
        }
      />
      
      {renderGradeView()}
    </div>
  );
};

export default GradesPage;
