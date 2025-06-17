
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useAssignmentSubmissions = (userId: string | undefined) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [submissionTexts, setSubmissionTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchAssignments();
      fetchSubmissions();
    }
  }, [userId]);

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
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', userId);

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
    if (!userId) return;

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
            student_id: userId,
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

  return {
    assignments,
    submissions,
    submissionTexts,
    loading,
    submitting,
    handleSubmissionTextChange,
    handleSubmitAssignment,
    refetch: fetchSubmissions
  };
};
