
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Exam {
  id: string;
  title: string;
  subject_id: string;
  class_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  exam_type: string;
  room_number: string | null;
}

interface ExamListProps {
  exams: Exam[];
  onEdit: (exam: Exam) => void;
  onDelete: (examId: string) => void;
}

const ExamList: React.FC<ExamListProps> = ({ exams, onEdit, onDelete }) => {
  if (exams.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No exams scheduled</p>
      </div>
    );
  }

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'written': return 'default';
      case 'practical': return 'secondary';
      case 'oral': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exam Details</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Marks</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell>
              <div>
                <div className="font-medium">{exam.title}</div>
                <div className="text-sm text-muted-foreground">{exam.subject_id}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div>
                  <div className="font-medium">
                    {format(new Date(exam.exam_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {exam.start_time} - {exam.end_time}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {exam.duration_minutes} min
              </div>
            </TableCell>
            <TableCell>
              {exam.room_number && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {exam.room_number}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={getExamTypeColor(exam.exam_type)}>
                {exam.exam_type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm font-medium">
                {exam.total_marks} pts
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(exam)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(exam.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExamList;
