
import React from 'react';
import { format } from 'date-fns';

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

interface SubmissionFeedbackProps {
  assignment: Assignment;
  submission: Submission;
}

const SubmissionFeedback: React.FC<SubmissionFeedbackProps> = ({ assignment, submission }) => {
  if (!submission.submitted_at) return null;

  return (
    <div className="space-y-4">
      {submission.feedback && (
        <div>
          <p className="text-sm font-medium mb-2">Teacher Feedback:</p>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{submission.feedback}</p>
            {submission.grade !== null && (
              <p className="text-sm font-medium mt-2">
                Grade: {submission.grade}/{assignment.total_points}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Submitted on: {format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
      </p>
    </div>
  );
};

export default SubmissionFeedback;
