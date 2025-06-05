
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useTeacherGradeData } from '@/hooks/useTeacherGradeData';
import { useGradeComments } from '@/hooks/useGradeComments';
import EnhancedGradeSelectionForm from './EnhancedGradeSelectionForm';
import GradeSubmissionStatus from './GradeSubmissionStatus';
import GradeInputRow from './GradeInputRow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Download, Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const EnhancedTeacherGradeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAssignment, setSelectedAssignment] = useState('general');
  const [newTotalMarks, setNewTotalMarks] = useState('100');
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  
  const {
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedExamType,
    setSelectedExamType,
    classes,
    subjects,
    studentGrades,
    loading,
    newGradeValues,
    setNewGradeValues
  } = useTeacherGradeData(user);

  const { comments, updateComment, getComment } = useGradeComments();

  // Mock assignments data - in real app, this would come from a hook
  const assignments = [
    { id: 'hw1', name: 'Homework 1', type: 'assignment', maxMarks: 20, dueDate: '2024-01-15' },
    { id: 'quiz1', name: 'Chapter 1 Quiz', type: 'quiz', maxMarks: 15 },
    { id: 'project1', name: 'Science Fair Project', type: 'project', maxMarks: 50, dueDate: '2024-02-01' }
  ];

  const gradedStudents = studentGrades.filter(s => s.grade).length;
  const pendingStudents = studentGrades.length - gradedStudents;
  const hasUnsavedChanges = Object.keys(newGradeValues).length > 0;

  const handleGradeInputChange = (studentId: string, value: string) => {
    setNewGradeValues(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrade = async (studentId: string) => {
    // Implementation would include saving both grade and comment
    setSavingGrades(prev => ({ ...prev, [studentId]: true }));
    
    try {
      // Save logic here - would include comments
      const comment = getComment(studentId);
      console.log(`Saving grade for ${studentId} with comment: ${comment}`);
      
      toast({
        title: "Success",
        description: "Grade and feedback saved successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save grade"
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleBulkSave = async () => {
    toast({
      title: "Saving",
      description: "Saving all grades and feedback..."
    });
    
    // Bulk save implementation
    console.log("Bulk saving grades with comments:", comments);
  };

  if (!selectedClass || !selectedSubject) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Enhanced Grade Management</h2>
        <EnhancedGradeSelectionForm
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedExamType={selectedExamType}
          setSelectedExamType={setSelectedExamType}
          selectedAssignment={selectedAssignment}
          setSelectedAssignment={setSelectedAssignment}
          classes={classes}
          subjects={subjects}
          assignments={assignments}
        />
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Please select a class and subject to begin grading</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Enhanced Grade Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <EnhancedGradeSelectionForm
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedExamType={selectedExamType}
        setSelectedExamType={setSelectedExamType}
        selectedAssignment={selectedAssignment}
        setSelectedAssignment={setSelectedAssignment}
        classes={classes}
        subjects={subjects}
        assignments={assignments}
      />

      <GradeSubmissionStatus
        totalStudents={studentGrades.length}
        gradedStudents={gradedStudents}
        pendingStudents={pendingStudents}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Grade Entry</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Enter grades and feedback for each student
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Total Marks:</label>
                <Input
                  type="number"
                  value={newTotalMarks}
                  onChange={(e) => setNewTotalMarks(e.target.value)}
                  className="w-20"
                />
              </div>
              
              <Button onClick={handleBulkSave} disabled={!hasUnsavedChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save All ({Object.keys(newGradeValues).length})
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : studentGrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found in this class
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Current Grade</TableHead>
                    <TableHead>New Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGrades.map(student => (
                    <GradeInputRow
                      key={student.id}
                      student={student}
                      newValue={newGradeValues[student.id] || ''}
                      newTotalMarks={newTotalMarks}
                      isSaving={savingGrades[student.id] || false}
                      onInputChange={(value) => handleGradeInputChange(student.id, value)}
                      onSave={() => handleSaveGrade(student.id)}
                      onCommentChange={(comment) => updateComment(student.id, comment)}
                      currentComment={getComment(student.id)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardContent className="pt-6">
          <div className="bg-muted p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">Teacher Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Select assignment type and specific assessment before entering grades</li>
              <li>Add meaningful feedback comments for each student</li>
              <li>Use "Save All" to submit all grades at once, or save individually</li>
              <li>Monitor your progress using the status indicator above</li>
              <li>Grades become visible to students and parents once saved</li>
              <li>Comments help students understand their performance and areas for improvement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTeacherGradeView;
