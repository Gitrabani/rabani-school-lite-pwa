
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface GradeData {
  student_id: string;
  subject_id: string;
  class_id: string;
  exam_type: string;
  marks: number;
  total_marks: number;
  date: string;
  created_by: string;
  finalized: boolean;
}

export const gradeService = {
  async checkExistingGrade(
    studentId: string,
    subjectId: string,
    classId: string,
    examType: string
  ) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .eq('class_id', classId)
      .eq('exam_type', examType)
      .maybeSingle();

    return { data, error };
  },

  async updateGrade(gradeId: string, marks: number, totalMarks: number) {
    const { error } = await supabase
      .from('grades')
      .update({
        marks,
        total_marks: totalMarks,
        updated_at: new Date().toISOString(),
        finalized: true
      })
      .eq('id', gradeId);

    return { error };
  },

  async createGrade(gradeData: GradeData) {
    const { error } = await supabase
      .from('grades')
      .insert({
        ...gradeData,
        date: format(new Date(), 'yyyy-MM-dd'),
      });

    return { error };
  }
};
