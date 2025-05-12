
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentGradesBySubject from './StudentGradesBySubject';
import StudentGradesByExam from './StudentGradesByExam';
import { useOwnGrades } from '@/hooks/useOwnGrades';
import { useReportCardStatus } from '@/hooks/useReportCardStatus';
import { useAuth } from '../../context/auth/AuthProvider';
import DownloadReportCardButton from './DownloadReportCardButton';
import ResultFormDownloadButton from './ResultFormDownloadButton';
import { Separator } from '@/components/ui/separator';

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
      
      <div className="mt-8 space-y-4">
        <Separator />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">Download Options</h3>
            <p className="text-sm text-muted-foreground">Download your grade reports and result forms</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {user?.id && (
              <>
                <ResultFormDownloadButton 
                  studentName={user.name} 
                  studentId={user.id} 
                  grades={ownGrades}
                  disabled={loading || ownGrades.length === 0}
                />
                
                <DownloadReportCardButton studentId={user.id} enabled={reportReady} />
              </>
            )}
          </div>
        </div>
        
        {!reportReady && (
          <div className="text-xs text-muted-foreground">
            The report card will be available once your teacher finalizes all grades.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGradeView;
