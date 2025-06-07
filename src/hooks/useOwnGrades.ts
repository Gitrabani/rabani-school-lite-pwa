
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
        console.log('No userId provided to useOwnGrades');
        setGrades([]);
        setGradesBySubject({});
        setSubjects({});
        setClassId('');
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching grades for user:', userId);
        
        // First, let's check if the user exists in the database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify user profile"
          });
          return;
        }

        console.log('User profile found:', profileData);

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
          console.error('Error fetching grades:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to load grades: ${error.message}`
          });
          return;
        }

        console.log('Successfully fetched grades:', data);
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
    ownGrades: grades,
    loading, 
    gradesBySubject, 
    subjects, 
    classId 
  };
};
