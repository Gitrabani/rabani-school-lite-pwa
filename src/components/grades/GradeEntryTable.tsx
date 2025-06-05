
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import GradeInputRow from './GradeInputRow';

interface GradeEntryTableProps {
  studentGrades: any[];
  loading: boolean;
  newGradeValues: Record<string, string>;
  newTotalMarks: string;
  setNewTotalMarks: (value: string) => void;
  savingGrades: Record<string, boolean>;
  hasUnsavedChanges: boolean;
  onGradeInputChange: (studentId: string, value: string) => void;
  onSaveGrade: (studentId: string) => void;
  onBulkSave: () => void;
  onCommentChange: (studentId: string, comment: string) => void;
  getComment: (studentId: string) => string;
}

const GradeEntryTable: React.FC<GradeEntryTableProps> = ({
  studentGrades,
  loading,
  newGradeValues,
  newTotalMarks,
  setNewTotalMarks,
  savingGrades,
  hasUnsavedChanges,
  onGradeInputChange,
  onSaveGrade,
  onBulkSave,
  onCommentChange,
  getComment
}) => {
  return (
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
            
            <Button onClick={onBulkSave} disabled={!hasUnsavedChanges}>
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
                    onInputChange={(value) => onGradeInputChange(student.id, value)}
                    onSave={() => onSaveGrade(student.id)}
                    onCommentChange={(comment) => onCommentChange(student.id, comment)}
                    currentComment={getComment(student.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradeEntryTable;
