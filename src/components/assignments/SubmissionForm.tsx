
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { isPast } from 'date-fns';

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

interface SubmissionFormProps {
  assignment: Assignment;
  submission?: Submission;
  submissionText: string;
  isSubmitting: boolean;
  onSubmissionTextChange: (text: string) => void;
  onSubmit: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
  assignment,
  submission,
  submissionText,
  isSubmitting,
  onSubmissionTextChange,
  onSubmit
}) => {
  const dueDate = new Date(assignment.due_date);
  const isOverdue = isPast(dueDate);
  const isSubmitted = submission?.submitted_at;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Your Submission:</p>
        <Textarea
          placeholder="Enter your assignment response here..."
          value={submissionText}
          onChange={(e) => onSubmissionTextChange(e.target.value)}
          rows={4}
          disabled={isOverdue && !isSubmitted}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || (isOverdue && !isSubmitted)}
        >
          {isSubmitting ? (
            'Submitting...'
          ) : isSubmitted ? (
            'Update Submission'
          ) : (
            'Submit Assignment'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubmissionForm;
