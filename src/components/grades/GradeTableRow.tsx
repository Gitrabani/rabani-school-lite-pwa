
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react';

interface GradeTableRowProps {
  student: {
    id: string;
    name: string;
    grade?: {
      marks: number;
      total_marks: number;
    } | null;
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
  const hasExistingGrade = student.grade !== null && student.grade !== undefined;
  const displayValue = hasExistingGrade && !newValue ? student.grade?.marks.toString() : newValue;
  const totalMarks = hasExistingGrade ? student.grade?.total_marks : parseInt(newTotalMarks);
  
  const calculatePercentage = () => {
    if (hasExistingGrade && !newValue) {
      return ((student.grade?.marks / student.grade?.total_marks) * 100).toFixed(1);
    } else if (newValue && totalMarks) {
      return ((parseFloat(newValue) / totalMarks) * 100).toFixed(1);
    }
    return "";
  };
  
  const getGradeClass = () => {
    const percentage = parseFloat(calculatePercentage());
    if (isNaN(percentage)) return "";
    if (percentage >= 90) return "text-green-600 font-semibold";
    if (percentage >= 80) return "text-emerald-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-4">
          {isTeacher ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={displayValue}
                onChange={(e) => onInputChange(e.target.value)}
                className="w-20"
                placeholder="0"
                min="0"
                max={newTotalMarks}
                disabled={isSaving}
              />
              <span className="text-sm text-muted-foreground">/ {totalMarks}</span>
              
              {calculatePercentage() && (
                <span className={`text-sm ${getGradeClass()}`}>
                  {calculatePercentage()}%
                </span>
              )}
            </div>
          ) : (
            hasExistingGrade ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{student.grade?.marks}</span>
                <span className="text-sm text-muted-foreground">/ {student.grade?.total_marks}</span>
                <span className={`text-sm ${getGradeClass()}`}>
                  {calculatePercentage()}%
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground italic">Not graded</span>
            )
          )}
        </div>
      </TableCell>
      
      {isTeacher && (
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !newValue}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};

export default GradeTableRow;
