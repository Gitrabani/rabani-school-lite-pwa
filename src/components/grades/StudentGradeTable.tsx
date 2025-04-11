import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StudentGradeTableProps {
  selectedClass: string;
  selectedSubject: string;
  selectedExamType: string;
  studentGrades: any[];
  loading: boolean;
  newGradeValues: Record<string, string>;
  setNewGradeValues: (values: Record<string, string>) => void;
  user: any;
}

const StudentGradeTable: React.FC<StudentGradeTableProps> = ({
  selectedClass,
  selectedSubject,
  selectedExamType,
  studentGrades,
  loading,
  newGradeValues,
  setNewGradeValues,
  user
}) => {
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  const [newTotalMarks, setNewTotalMarks] = useState<string>('100');

  const handleGradeInputChange = (studentId: string, value: string) => {
    const updatedValues = { ...newGradeValues, [studentId]: value };
    setNewGradeValues(updatedValues);
  };

  const handleSaveGrade = async (studentId: string) => {
    if (!user || !selectedClass || !selectedSubject) return;
    
    const marksValue = newGradeValues[studentId];
    if (!marksValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return;
    }
    
    const marks = parseFloat(marksValue);
    const totalMarks = parseFloat(newTotalMarks);
    
    if (isNaN(marks) || marks < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return;
    }
    
    if (isNaN(totalMarks) || totalMarks <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid total marks",
      });
      return;
    }
    
    setSavingGrades(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const { data: existingGrade } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject_id', selectedSubject)
        .eq('class_id', selectedClass)
        .eq('exam_type', selectedExamType)
        .maybeSingle();
      
      if (existingGrade) {
        const { error } = await supabase
          .from('grades')
          .update({
            marks,
            total_marks: totalMarks,
            updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX")
          })
          .eq('id', existingGrade.id);
        
        if (error) {
          console.error("Error updating grade:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update grade",
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('grades')
          .insert({
            student_id: studentId,
            subject_id: selectedSubject,
            class_id: selectedClass,
            exam_type: selectedExamType,
            marks,
            total_marks: totalMarks,
            date: format(new Date(), 'yyyy-MM-dd'),
            created_by: user.id
          });
        
        if (error) {
          console.error("Error creating grade:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save grade",
          });
          return;
        }
      }
      
      toast({
        title: "Success",
        description: "Grade has been saved",
      });
    } catch (error) {
      console.error("Error saving grade:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Grades</CardTitle>
        {user?.role === 'teacher' && (
          <div className="flex items-center mt-2">
            <label className="text-sm font-medium mr-3">Total Marks:</label>
            <Input 
              type="number" 
              className="w-24" 
              value={newTotalMarks} 
              onChange={(e) => setNewTotalMarks(e.target.value)}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : studentGrades.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No students found in this class</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Current Marks</TableHead>
                  {user?.role === 'teacher' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentGrades.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      {student.grade ? (
                        <>
                          {student.grade.marks} / {student.grade.total_marks} 
                          ({Math.round((student.grade.marks / student.grade.total_marks) * 100)}%)
                        </>
                      ) : (
                        'Not graded'
                      )}
                    </TableCell>
                    {user?.role === 'teacher' && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Input 
                            type="number" 
                            className="w-20 mr-2" 
                            placeholder="Marks"
                            value={newGradeValues[student.id] || ''}
                            onChange={(e) => handleGradeInputChange(student.id, e.target.value)}
                          />
                          <span className="mr-2">/ {newTotalMarks}</span>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveGrade(student.id)}
                            disabled={savingGrades[student.id]}
                          >
                            {savingGrades[student.id] ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentGradeTable;
