
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentGradesBySubjectProps {
  gradesBySubject: Record<string, any[]>;
  loading: boolean;
}

const StudentGradesBySubject: React.FC<StudentGradesBySubjectProps> = ({ gradesBySubject, loading }) => {
  return (
    <>
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      ) : Object.entries(gradesBySubject).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No grades available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.entries(gradesBySubject).map(([subjectName, grades]) => (
            <Card key={subjectName}>
              <CardHeader>
                <CardTitle>{subjectName}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Type</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Out of</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map(grade => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">
                          {grade.exam_type.charAt(0).toUpperCase() + grade.exam_type.slice(1)}
                        </TableCell>
                        <TableCell>{grade.marks}</TableCell>
                        <TableCell>{grade.total_marks}</TableCell>
                        <TableCell>
                          {Math.round((grade.marks / grade.total_marks) * 100)}%
                        </TableCell>
                        <TableCell>{grade.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default StudentGradesBySubject;
