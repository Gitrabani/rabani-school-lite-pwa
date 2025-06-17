
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useAssignmentSubmissions } from './hooks/useAssignmentSubmissions';
import AssignmentCard from './AssignmentCard';
import SubmissionForm from './SubmissionForm';
import SubmissionFeedback from './SubmissionFeedback';

const StudentAssignmentView: React.FC = () => {
  const { user } = useAuth();
  const {
    assignments,
    submissions,
    submissionTexts,
    loading,
    submitting,
    handleSubmissionTextChange,
    handleSubmitAssignment
  } = useAssignmentSubmissions(user?.id);

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No assignments available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Assignments</h1>
      
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const submission = submissions[assignment.id];

          return (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              submission={submission}
            >
              <SubmissionForm
                assignment={assignment}
                submission={submission}
                submissionText={submissionTexts[assignment.id] || ''}
                isSubmitting={submitting[assignment.id] || false}
                onSubmissionTextChange={(text) => handleSubmissionTextChange(assignment.id, text)}
                onSubmit={() => handleSubmitAssignment(assignment.id)}
              />

              {submission && (
                <SubmissionFeedback
                  assignment={assignment}
                  submission={submission}
                />
              )}
            </AssignmentCard>
          );
        })}
      </div>
    </div>
  );
};

export default StudentAssignmentView;
