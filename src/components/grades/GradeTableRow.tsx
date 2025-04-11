
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GradeTableRowProps {
  student: {
    id: string;
    name: string;
    grade?: {
      marks: number;
      total_marks: number;
    }
  };
  newValue: string;
  newTotalMarks: string;
  isTeacher: boolean;
  isSaving: boolean;
  onInputChange: (value: string) => void;
  onSave: () => void;
}

const GradeTableRow: React.FC<GradeTableRowProps> = ({
  student,
  newValue,
  newTotalMarks,
  isTeacher,
  isSaving,
  onInputChange,
  onSave
}) => {
  return (
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
      {isTeacher && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end">
            <Input 
              type="number" 
              className="w-20 mr-2" 
              placeholder="Marks"
              value={newValue} 
              onChange={(e) => onInputChange(e.target.value)}
            />
            <span className="mr-2">/ {newTotalMarks}</span>
            <Button 
              size="sm" 
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default GradeTableRow;
