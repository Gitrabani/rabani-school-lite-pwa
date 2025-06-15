
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  total_points: number;
  due_date: string;
}

interface Submission {
  id: string;
  student_id: string;
  submission_text: string;
  submitted_at: string;
  grade: number | null;
  feedback: string;
  graded_at: string | null;
}

interface Student {
  id: string;
  full_name: string;
}

interface AssignmentGradingProps {
  assignment: Assignment;
  onBack: () => void;
}

const AssignmentGrading: React.FC<AssignmentGradingProps> = ({
  assignment,
  onBack,
}) => {
  const [submissions, setSubmissions] = useState<(Submission & { student: Student })[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingData, setGradingData] = useState<Record<string, { grade: string; feedback: string }>>({});
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignment.id);

      if (submissionsError) throw submissionsError;

      // Fetch student profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Combine submissions with student data
      const submissionsWithStudents = submissionsData?.map(submission => {
        const student = profilesData?.find(profile => profile.id === submission.student_id);
        return {
          ...submission,
          student: student || { id: submission.student_id, full_name: 'Unknown Student' }
        };
      }) || [];

      setSubmissions(submissionsWithStudents);

      // Initialize grading data
      const initialGradingData: Record<string, { grade: string; feedback: string }> = {};
      submissionsWithStudents.forEach((submission) => {
        initialGradingData[submission.id] = {
          grade: submission.grade?.toString() || '',
          feedback: submission.feedback || '',
        };
      });
      setGradingData(initialGradingData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch submissions',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignment.id]);

  const handleGradeChange = (submissionId: string, field: 'grade' | 'feedback', value: string) => {
    setGradingData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (submissionId: string) => {
    const gradeData = gradingData[submissionId];
    if (!gradeData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          grade: gradeData.grade ? parseFloat(gradeData.grade) : null,
          feedback: gradeData.feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Grade saved successfully',
      });
      fetchSubmissions();
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save grade',
      });
    }
  };

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-muted-foreground">
            Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')} • {assignment.total_points} points
          </p>
        </div>
        <Button onClick={onBack} variant="outline">
          Back to Assignments
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No submissions yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Submission</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.student?.full_name || 'Unknown Student'}
                    </TableCell>
                    <TableCell>
                      {submission.submitted_at ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {format(new Date(submission.submitted_at), 'MMM dd, HH:mm')}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          Not submitted
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">
                        {submission.submission_text || 'No submission text'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={assignment.total_points}
                        placeholder="Grade"
                        value={gradingData[submission.id]?.grade || ''}
                        onChange={(e) => handleGradeChange(submission.id, 'grade', e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Feedback"
                        value={gradingData[submission.id]?.feedback || ''}
                        onChange={(e) => handleGradeChange(submission.id, 'feedback', e.target.value)}
                        rows={2}
                        className="min-w-[200px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSaveGrade(submission.id)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentGrading;
