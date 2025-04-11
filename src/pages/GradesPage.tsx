
import React from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/shared/PageHeader';
import StudentGradeView from '@/components/grades/StudentGradeView';
import TeacherGradeView from '@/components/grades/TeacherGradeView';

const GradesPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader 
        title="Grades" 
        description={user?.role === 'teacher' ? "Manage student grades" : "View grade records"}
      />
      
      {user?.role === 'student' ? (
        <StudentGradeView />
      ) : (
        <TeacherGradeView />
      )}
    </div>
  );
};

export default GradesPage;
