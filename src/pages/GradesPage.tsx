
import React from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import PageHeader from '../components/shared/PageHeader';
import StudentGradeView from '@/components/grades/StudentGradeView';
import TeacherGradeView from '@/components/grades/TeacherGradeView';
import ParentGradeView from '@/components/grades/ParentGradeView';
import { Card, CardContent } from '@/components/ui/card';

const GradesPage: React.FC = () => {
  const { user } = useAuth();

  console.log('Current user in GradesPage:', user);

  const renderGradeView = () => {
    switch (user?.role) {
      case 'student':
        console.log('Rendering StudentGradeView for student');
        return <StudentGradeView />;
      case 'teacher':
        console.log('Rendering TeacherGradeView for teacher');
        return <TeacherGradeView />;
      case 'parent':
        console.log('Rendering ParentGradeView for parent');
        return <ParentGradeView />;
      case 'admin':
        // Admin now sees the same view as students
        console.log('Rendering StudentGradeView for admin');
        return <StudentGradeView />;
      default:
        console.log('No user or unrecognized role, showing login prompt');
        return (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Please log in to view grades</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div>
      <PageHeader 
        title="Grades" 
        description={
          user?.role === 'teacher' ? "Manage student grades" : 
          user?.role === 'parent' ? "View your children's grades" :
          user?.role === 'admin' ? "View all grade records" :
          "View grade records"
        }
      />
      
      {renderGradeView()}
    </div>
  );
};

export default GradesPage;
