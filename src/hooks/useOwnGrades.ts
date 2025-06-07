
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOwnGrades = (userId?: string) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [classId, setClassId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchGrades = async () => {
      // Don't fetch if no userId provided
      if (!userId) {
        console.log('useOwnGrades: No userId provided, skipping fetch');
        setGrades([]);
        setGradesBySubject({});
        setSubjects({});
        setClassId('');
        return;
      }

      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.log('useOwnGrades: No active session, skipping fetch');
        // Clear state when not authenticated
        setGrades([]);
        setGradesBySubject({});
        setSubjects({});
        setClassId('');
        return;
      }

      if (session.user.id !== userId) {
        console.log('useOwnGrades: Session user ID does not match provided userId');
        return;
      }

      setLoading(true);
      console.log('useOwnGrades: Starting grade fetch for user:', userId);
      
      try {
        // Fetch grades for the user
        const { data, error } = await supabase
          .from('grades')
          .select(`
            *,
            classes!inner(
              name,
              section
            )
          `)
          .eq('student_id', userId)
          .eq('finalized', true)
          .order('date', { ascending: false });

        if (error) {
          console.error('useOwnGrades: Grade fetch error:', error);
          toast({
            variant: "destructive",
            title: "Error Loading Grades",
            description: `Failed to load grades: ${error.message}`
          });
          return;
        }

        console.log('useOwnGrades: Successfully fetched grades:', data?.length || 0, 'records');
        const gradesData = data || [];
        setGrades(gradesData);

        // Group grades by subject
        const gradesBySubj = gradesData.reduce((acc: Record<string, any[]>, grade: any) => {
          if (!acc[grade.subject_id]) {
            acc[grade.subject_id] = [];
          }
          acc[grade.subject_id].push(grade);
          return acc;
        }, {});
        setGradesBySubject(gradesBySubj);

        // Create subjects map
        const subjectsMap = gradesData.reduce((acc: Record<string, string>, grade: any) => {
          acc[grade.subject_id] = grade.subject_id;
          return acc;
        }, {});
        setSubjects(subjectsMap);

        // Set class ID from first grade if available
        if (gradesData.length > 0) {
          setClassId(gradesData[0].class_id);
        }

      } catch (error: any) {
        console.error('useOwnGrades: Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: `An unexpected error occurred: ${error.message}`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [userId, toast]);

  return { 
    grades, 
    ownGrades: grades,
    loading, 
    gradesBySubject, 
    subjects, 
    classId 
  };
};
