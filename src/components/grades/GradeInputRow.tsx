
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, MessageSquare, Upload } from 'lucide-react';
import ReportCardUploadDialog from './ReportCardUploadDialog';
import ReportCardList from './ReportCardList';

interface GradeInputRowProps {
  student: any;
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
  const [reportCardsDialogOpen, setReportCardsDialogOpen] = useState(false);
  const [tempComment, setTempComment] = useState(currentComment);

  const handleSaveComment = () => {
    onCommentChange(tempComment);
    setCommentDialogOpen(false);
  };

  const currentGrade = student.grade ? `${student.grade.marks}/${student.grade.total_marks}` : 'Not graded';
  const newGradeDisplay = newValue ? `${newValue}/${newTotalMarks}` : '';

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{student.name}</TableCell>
        <TableCell>{currentGrade}</TableCell>
        <TableCell>
          <Input
            type="number"
            value={newValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter marks"
            className="w-24"
            min="0"
            max={newTotalMarks}
          />
          {newGradeDisplay && (
            <div className="text-xs text-muted-foreground mt-1">
              {newGradeDisplay}
            </div>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center space-x-2">
            <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTempComment(currentComment)}
                >
                  <MessageSquare className="h-4 w-4" />
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
                    placeholder="Enter feedback or comments..."
                    rows={4}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCommentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveComment}>
                      Save Comment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ReportCardUploadDialog
              studentId={student.id}
              studentName={student.name}
            />

            <Dialog open={reportCardsDialogOpen} onOpenChange={setReportCardsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report Cards</DialogTitle>
                </DialogHeader>
                <ReportCardList
                  studentId={student.id}
                  studentName={student.name}
                />
              </DialogContent>
            </Dialog>

            <Button 
              onClick={onSave} 
              disabled={isSaving || !newValue}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

export default GradeInputRow;
