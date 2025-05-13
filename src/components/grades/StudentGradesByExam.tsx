
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentGradesByExamProps {
  ownGrades: any[];
  loading: boolean;
  subjects: Record<string, string>;
}

// Utility to group grades by exam type and calculate totals
function getTotalsByExamType(grades: any[]) {
  const result: Record<string, { totalMarks: number; totalObtained: number }> = {};
  if (!grades) return result;
  grades.forEach((grade) => {
    if (!grade.exam_type) return;
    if (!result[grade.exam_type]) {
      result[grade.exam_type] = { totalMarks: 0, totalObtained: 0 };
    }
    result[grade.exam_type].totalMarks += Number(grade.total_marks ?? 0);
    result[grade.exam_type].totalObtained += Number(grade.marks ?? 0);
  });
  return result;
}

const StudentGradesByExam: React.FC<StudentGradesByExamProps> = ({ 
  ownGrades, 
  loading, 
  subjects 
}) => {
  const totalsByExam = getTotalsByExamType(ownGrades);

  return (
    <Card className="bg-card dark:bg-navy-900">
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
          <>
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
            {/* Totals by exam type */}
            {Object.keys(totalsByExam).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">Totals By Exam Type</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Type</TableHead>
                      <TableHead>Total Marks Obtained</TableHead>
                      <TableHead>Total Out of</TableHead>
                      <TableHead>Total Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(totalsByExam).map(([examType, totals]) => (
                      <TableRow key={examType}>
                        <TableCell className="font-medium">
                          {examType.charAt(0).toUpperCase() + examType.slice(1)}
                        </TableCell>
                        <TableCell>
                          {totals.totalObtained}
                        </TableCell>
                        <TableCell>
                          {totals.totalMarks}
                        </TableCell>
                        <TableCell>
                          {totals.totalMarks > 0
                            ? `${Math.round((totals.totalObtained / totals.totalMarks) * 100)}%`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentGradesByExam;
