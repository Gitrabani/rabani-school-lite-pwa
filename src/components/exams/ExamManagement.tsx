
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ExamForm from './ExamForm';
import ExamList from './ExamList';
import ConflictsList from './ConflictsList';

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
  instructions: string | null;
  exam_type: string;
  room_number: string | null;
  invigilator_id: string | null;
  created_by: string;
}

interface Conflict {
  id: string;
  exam1_id: string;
  exam2_id: string;
  conflict_type: string;
  conflict_details: any;
  resolved: boolean;
}

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
    fetchConflicts();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('exam_date', { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch exams',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConflicts = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_conflicts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConflicts(data || []);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    }
  };

  const handleCreateExam = () => {
    setEditingExam(null);
    setShowForm(true);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExam(null);
    fetchExams();
    fetchConflicts();
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Exam deleted successfully',
      });

      fetchExams();
      fetchConflicts();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete exam',
      });
    }
  };

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exam Management</h1>
        <Button onClick={handleCreateExam}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Exam
        </Button>
      </div>

      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Scheduling Conflicts Detected ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConflictsList conflicts={conflicts} onRefresh={fetchConflicts} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Exam Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExamList 
            exams={exams} 
            onEdit={handleEditExam}
            onDelete={handleDeleteExam}
          />
        </CardContent>
      </Card>

      {showForm && (
        <ExamForm
          exam={editingExam}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default ExamManagement;
