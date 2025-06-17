
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  instructions: string;
  class_id: string;
  subject_id: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string;
  submitted_at: string | null;
  grade: number | null;
  feedback: string | null;
}

interface AssignmentCardProps {
  assignment: Assignment;
  submission?: Submission;
  children: React.ReactNode;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, submission, children }) => {
  const dueDate = new Date(assignment.due_date);
  const isOverdue = isPast(dueDate);
  const isSubmitted = submission?.submitted_at;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {assignment.description}
            </p>
          </div>
          <div className="flex space-x-2">
            {isSubmitted ? (
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            ) : isOverdue ? (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            ) : (
              <Badge variant="outline">Pending</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Due: {format(dueDate, 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {assignment.total_points} points
            </div>
          </div>

          {assignment.instructions && (
            <div>
              <p className="text-sm font-medium mb-2">Instructions:</p>
              <p className="text-sm text-muted-foreground">
                {assignment.instructions}
              </p>
            </div>
          )}

          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
