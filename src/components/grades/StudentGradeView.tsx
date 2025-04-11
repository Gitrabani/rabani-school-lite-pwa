
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentGradesBySubject from './StudentGradesBySubject';
import StudentGradesByExam from './StudentGradesByExam';
import { useOwnGrades } from '@/hooks/useOwnGrades';

const StudentGradeView: React.FC = () => {
  const { ownGrades, loading, gradesBySubject } = useOwnGrades();

  return (
    <div>
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
            ownGrades={ownGrades} 
            loading={loading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentGradeView;
