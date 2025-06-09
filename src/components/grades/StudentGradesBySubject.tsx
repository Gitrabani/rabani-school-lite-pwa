
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, Download } from 'lucide-react';
import GradeImportDialog from './GradeImportDialog';
import BulkReportUploadDialog from './BulkReportUploadDialog';
import { convertGradesToCSV, downloadCSV } from '@/utils/gradesCsvUtils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface StudentGradesBySubjectProps {
  gradesBySubject: Record<string, any[]>;
  loading: boolean;
}

const StudentGradesBySubject: React.FC<StudentGradesBySubjectProps> = ({ gradesBySubject, loading }) => {
  const { toast } = useToast();

  const handleImportGrades = async (importData: any[]) => {
    // Placeholder implementation - would need proper integration
    toast({
      title: "Import Not Available",
      description: "Grade import is only available for teachers"
    });
  };

  const handleExportGrades = () => {
    const allGrades = Object.values(gradesBySubject).flat();
    if (allGrades.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No grades available to export"
      });
      return;
    }

    // Convert to CSV format
    let csvContent = "Subject,Exam Type,Marks,Total Marks,Percentage,Date\n";
    
    Object.entries(gradesBySubject).forEach(([subjectName, grades]) => {
      grades.forEach(grade => {
        const percentage = Math.round((grade.marks / grade.total_marks) * 100);
        csvContent += `"${subjectName}",${grade.exam_type},${grade.marks},${grade.total_marks},${percentage}%,${grade.date}\n`;
      });
    });

    const fileName = `my_grades_by_subject_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Your grades have been exported successfully"
    });
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <GradeImportDialog onImport={handleImportGrades} />
        <BulkReportUploadDialog classId="student-class" />
        <Button variant="outline" onClick={handleExportGrades}>
          <Download className="h-4 w-4 mr-2" />
          Export Grades
        </Button>
      </div>

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
            <Card key={subjectName} className="bg-card dark:bg-navy-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{subjectName}</CardTitle>
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
