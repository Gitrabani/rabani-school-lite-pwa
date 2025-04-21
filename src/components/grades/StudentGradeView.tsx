import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentGradesBySubject from './StudentGradesBySubject';
import StudentGradesByExam from './StudentGradesByExam';
import { useOwnGrades } from '@/hooks/useOwnGrades';
import { useReportCardStatus } from '@/hooks/useReportCardStatus';
import { useAuth } from '../../context/auth/AuthProvider';
import DownloadReportCardButton from './DownloadReportCardButton';

const StudentGradeView: React.FC = () => {
  const { user } = useAuth();
  const { ownGrades, loading, gradesBySubject, subjects, classId } = useOwnGrades();
  const reportReady = useReportCardStatus(user?.id as string);

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
            subjects={subjects}
          />
        </TabsContent>
      </Tabs>
      <div className="mt-8 text-right">
        {user?.id && (
          <DownloadReportCardButton studentId={user.id} enabled={reportReady} />
        )}
        {!reportReady && (
          <div className="text-xs text-muted-foreground mt-2">
            The report card will be available once your teacher finalizes all grades.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGradeView;
