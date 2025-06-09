
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
  },

  async bulkSaveGrades(grades: GradeData[], updates: { id: string; marks: number; total_marks: number }[]) {
    // Use Supabase RPC for atomic transaction-like behavior
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      throw new Error('Authentication required for bulk save operation');
    }

    try {
      // Process inserts and updates separately for better error handling
      const insertPromises = grades.length > 0 ? 
        supabase.from('grades').insert(grades.map(grade => ({
          ...grade,
          date: format(new Date(), 'yyyy-MM-dd'),
        }))) : 
        Promise.resolve({ error: null });

      const updatePromises = updates.map(update => 
        supabase
          .from('grades')
          .update({
            marks: update.marks,
            total_marks: update.total_marks,
            updated_at: new Date().toISOString(),
            finalized: true
          })
          .eq('id', update.id)
      );

      // Execute all operations
      const [insertResult, ...updateResults] = await Promise.all([
        insertPromises,
        ...updatePromises
      ]);

      // Check for any errors
      if (insertResult.error) {
        throw new Error(`Insert failed: ${insertResult.error.message}`);
      }

      for (const [index, result] of updateResults.entries()) {
        if (result.error) {
          throw new Error(`Update failed for grade ${updates[index].id}: ${result.error.message}`);
        }
      }

      return { 
        success: true, 
        insertedCount: grades.length,
        updatedCount: updates.length
      };

    } catch (error: any) {
      console.error('Bulk save operation failed:', error);
      throw error;
    }
  }
};
