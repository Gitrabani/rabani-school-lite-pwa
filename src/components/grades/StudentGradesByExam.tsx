
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentGradesByExamProps {
  ownGrades: any[];
  loading: boolean;
  subjects: Record<string, string>;
}

const StudentGradesByExam: React.FC<StudentGradesByExamProps> = ({ 
  ownGrades, 
  loading, 
  subjects 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Exam Results</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownGrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No grades available
                  </TableCell>
                </TableRow>
              ) : (
                ownGrades.map(grade => {
                  const subjectName = subjects[grade.subject_id] || grade.subject_id || 'Unknown Subject';
                  return (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">
                        {subjectName}
                      </TableCell>
                      <TableCell>
                        {grade.exam_type.charAt(0).toUpperCase() + grade.exam_type.slice(1)}
                      </TableCell>
                      <TableCell>
                        {grade.marks} / {grade.total_marks}
                      </TableCell>
                      <TableCell>
                        {Math.round((grade.marks / grade.total_marks) * 100)}%
                      </TableCell>
                      <TableCell>{grade.date}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentGradesByExam;
