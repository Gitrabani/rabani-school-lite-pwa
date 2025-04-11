
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import GradeTableRow from './GradeTableRow';

interface GradeTableContentProps {
  loading: boolean;
  studentGrades: any[];
  newGradeValues: Record<string, string>;
  newTotalMarks: string;
  savingGrades: Record<string, boolean>;
  isTeacher: boolean;
  onGradeInputChange: (studentId: string, value: string) => void;
  onSaveGrade: (studentId: string) => void;
}

const GradeTableContent: React.FC<GradeTableContentProps> = ({
  loading,
  studentGrades,
  newGradeValues,
  newTotalMarks,
  savingGrades,
  isTeacher,
  onGradeInputChange,
  onSaveGrade
}) => {
  if (loading) {
    return (
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    );
  }

  if (studentGrades.length === 0) {
    return (
      <CardContent>
        <div className="text-center py-8 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No students found in this class</p>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Current Marks</TableHead>
              {isTeacher && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentGrades.map(student => (
              <GradeTableRow
                key={student.id}
                student={student}
                newValue={newGradeValues[student.id] || ''}
                newTotalMarks={newTotalMarks}
                isTeacher={isTeacher}
                isSaving={savingGrades[student.id] || false}
                onInputChange={(value) => onGradeInputChange(student.id, value)}
                onSave={() => onSaveGrade(student.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
};

export default GradeTableContent;
