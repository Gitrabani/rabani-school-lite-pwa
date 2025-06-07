
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
      if (!userId) {
        setGrades([]);
        setGradesBySubject({});
        setSubjects({});
        setClassId('');
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching grades for user:', userId);
        
        const { data, error } = await supabase
          .from('grades')
          .select(`
            *,
            class:class_id (
              name,
              section
            )
          `)
          .eq('student_id', userId)
          .eq('finalized', true)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching own grades:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load your grades"
          });
          return;
        }

        console.log('Fetched own grades:', data);
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
          acc[grade.subject_id] = grade.subject_id; // You might want to fetch actual subject names
          return acc;
        }, {});
        setSubjects(subjectsMap);

        // Set class ID from first grade if available
        if (gradesData.length > 0) {
          setClassId(gradesData[0].class_id);
        }
      } catch (error: any) {
        console.error('Unexpected error fetching grades:', error);
        toast({
          variant: "destructive",
          title: "Error", 
          description: `Failed to load grades: ${error.message}`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [userId, toast]);

  return { 
    grades, 
    ownGrades: grades, // Alias for backward compatibility
    loading, 
    gradesBySubject, 
    subjects, 
    classId 
  };
};
