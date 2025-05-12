
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentGradesBySubject from './StudentGradesBySubject';
import StudentGradesByExam from './StudentGradesByExam';

interface ChildGradeDisplayProps {
  selectedChild: string;
  childGrades: any[];
  gradesBySubject: Record<string, any[]>;
  subjects: Record<string, string>;
  loading: boolean;
}

const ChildGradeDisplay: React.FC<ChildGradeDisplayProps> = ({
  selectedChild,
  childGrades,
  gradesBySubject,
  subjects,
  loading
}) => {
  if (!selectedChild) {
    return null;
  }

  return (
    <Tabs defaultValue="bySubject">
      <TabsList className="mb-4">
        <TabsTrigger value="bySubject">By Subject</TabsTrigger>
        <TabsTrigger value="byExam">By Exam Type</TabsTrigger>
      </TabsList>
      
      <TabsContent value="bySubject">
        <StudentGradesBySubject 
          gradesBySubject={gradesBySubject} 
          loading={loading} 
        />
      </TabsContent>
      
      <TabsContent value="byExam">
        <StudentGradesByExam 
          ownGrades={childGrades} 
          loading={loading}
          subjects={subjects}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ChildGradeDisplay;
