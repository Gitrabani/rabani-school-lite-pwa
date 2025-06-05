
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GradeInputRowProps {
  student: {
    id: string;
    name: string;
    grade?: {
      marks: number;
      total_marks: number;
      comments?: string;
    };
  };
  newValue: string;
  newTotalMarks: string;
  isSaving: boolean;
  onInputChange: (value: string) => void;
  onSave: () => void;
  onCommentChange: (comment: string) => void;
  currentComment: string;
}

const GradeInputRow: React.FC<GradeInputRowProps> = ({
  student,
  newValue,
  newTotalMarks,
  isSaving,
  onInputChange,
  onSave,
  onCommentChange,
  currentComment
}) => {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [tempComment, setTempComment] = useState(currentComment || '');

  const handleCommentSave = () => {
    onCommentChange(tempComment);
    setCommentDialogOpen(false);
  };

  const percentage = student.grade?.marks && student.grade?.total_marks 
    ? ((student.grade.marks / student.grade.total_marks) * 100).toFixed(1)
    : null;

  return (
    <TableRow>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>
        {student.grade ? (
          <div className="text-sm">
            <div className="font-medium">
              {student.grade.marks}/{student.grade.total_marks}
              {percentage && <span className="text-muted-foreground ml-1">({percentage}%)</span>}
            </div>
            {student.grade.comments && (
              <div className="text-xs text-muted-foreground mt-1">
                Comment: {student.grade.comments}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Not graded</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="0"
            max={newTotalMarks}
            value={newValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter marks"
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">/ {newTotalMarks}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTempComment(currentComment || '')}
              >
                <MessageSquare className="h-4 w-4" />
                {currentComment ? 'Edit' : 'Add'} Comment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Comment for {student.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
                  placeholder="Enter feedback or comments for this student..."
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCommentSave}>
                    Save Comment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving || !newValue}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default GradeInputRow;
