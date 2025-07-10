import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

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
}

interface UseExamFormProps {
  exam?: Exam | null;
  onClose: () => void;
}

export const useExamForm = ({ exam, onClose }: UseExamFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    class_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    total_marks: 100,
    instructions: '',
    exam_type: 'written',
    room_number: '',
    invigilator_id: '',
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    if (exam) {
      setFormData({
        title: exam.title,
        subject_id: exam.subject_id,
        class_id: exam.class_id,
        exam_date: exam.exam_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        instructions: exam.instructions || '',
        exam_type: exam.exam_type,
        room_number: exam.room_number || '',
        invigilator_id: exam.invigilator_id || '',
      });
    }
  }, [exam]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, section')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('class_subjects')
        .select('subject_id')
        .order('subject_id');

      if (error) throw error;
      // Get unique subjects
      const uniqueSubjects = [...new Set(data?.map(item => item.subject_id) || [])];
      setSubjects(uniqueSubjects.map(subject => ({ id: subject, name: subject })));
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const examData = {
        ...formData,
        created_by: user.id,
        duration_minutes: Number(formData.duration_minutes),
        total_marks: Number(formData.total_marks),
      };

      if (exam) {
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', exam.id);

        if (error) throw error;
      } else {
        const { data: newExam, error } = await supabase
          .from('exams')
          .insert(examData)
          .select()
          .single();

        if (error) throw error;

        // Check for conflicts after creating the exam
        if (newExam) {
          const { data: conflicts } = await supabase
            .rpc('detect_exam_conflicts', { exam_id: newExam.id });

          if (conflicts && conflicts.length > 0) {
            // Insert conflict records
            for (const conflict of conflicts) {
              await supabase
                .from('exam_conflicts')
                .insert({
                  exam1_id: newExam.id,
                  exam2_id: conflict.conflict_exam_id,
                  conflict_type: conflict.conflict_type,
                  conflict_details: conflict.conflict_details,
                });
            }

            toast({
              variant: 'destructive',
              title: 'Conflicts Detected',
              description: `${conflicts.length} scheduling conflict(s) found. Please review.`,
            });
          }
        }
      }

      toast({
        title: 'Success',
        description: exam ? 'Exam updated successfully' : 'Exam scheduled successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save exam',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    classes,
    subjects,
    loading,
    handleSubmit,
  };
};