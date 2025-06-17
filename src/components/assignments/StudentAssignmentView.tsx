
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

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

const StudentAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [submissionTexts, setSubmissionTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
      fetchSubmissions();
    }
  }, [user?.id]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch assignments',
      });
    }
  };

  const fetchSubmissions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;

      const submissionsMap: Record<string, Submission> = {};
      const textsMap: Record<string, string> = {};
      
      data?.forEach((submission) => {
        submissionsMap[submission.assignment_id] = submission;
        textsMap[submission.assignment_id] = submission.submission_text || '';
      });

      setSubmissions(submissionsMap);
      setSubmissionTexts(textsMap);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionTextChange = (assignmentId: string, text: string) => {
    setSubmissionTexts(prev => ({
      ...prev,
      [assignmentId]: text
    }));
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!user?.id) return;

    setSubmitting(prev => ({ ...prev, [assignmentId]: true }));

    try {
      const submissionText = submissionTexts[assignmentId] || '';
      const existingSubmission = submissions[assignmentId];

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('assignment_submissions')
          .update({
            submission_text: submissionText,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id);

        if (error) throw error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: assignmentId,
            student_id: user.id,
            submission_text: submissionText,
            submitted_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });

      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit assignment',
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

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
          const dueDate = new Date(assignment.due_date);
          const isOverdue = isPast(dueDate);
          const submission = submissions[assignment.id];
          const isSubmitted = submission?.submitted_at;

          return (
            <Card key={assignment.id}>
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

                  <div>
                    <p className="text-sm font-medium mb-2">Your Submission:</p>
                    <Textarea
                      placeholder="Enter your assignment response here..."
                      value={submissionTexts[assignment.id] || ''}
                      onChange={(e) => handleSubmissionTextChange(assignment.id, e.target.value)}
                      rows={4}
                      disabled={isOverdue && !isSubmitted}
                    />
                  </div>

                  {submission?.feedback && (
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

                  <div className="flex justify-between items-center">
                    {isSubmitted && (
                      <p className="text-sm text-muted-foreground">
                        Submitted on: {format(new Date(submission.submitted_at!), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                    
                    <Button
                      onClick={() => handleSubmitAssignment(assignment.id)}
                      disabled={submitting[assignment.id] || (isOverdue && !isSubmitted)}
                      className="ml-auto"
                    >
                      {submitting[assignment.id] ? (
                        'Submitting...'
                      ) : isSubmitted ? (
                        'Update Submission'
                      ) : (
                        'Submit Assignment'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentAssignmentView;
