
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
        return;
      }

      if (session.user.id !== userId) {
        console.log('useOwnGrades: Session user ID does not match provided userId');
        return;
      }

      setLoading(true);
      console.log('useOwnGrades: Starting grade fetch for user:', userId);
      
      try {
        // First, verify the user exists in profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('useOwnGrades: Profile fetch error:', profileError);
          if (profileError.code === 'PGRST116') {
            console.log('useOwnGrades: User profile not found');
            toast({
              variant: "destructive",
              title: "Profile Not Found",
              description: "User profile not found in the system"
            });
          } else {
            toast({
              variant: "destructive",
              title: "Profile Error",
              description: `Failed to verify user profile: ${profileError.message}`
            });
          }
          return;
        }

        console.log('useOwnGrades: User profile verified:', profileData);

        // Test basic connection to grades table
        const { data: testData, error: testError } = await supabase
          .from('grades')
          .select('id')
          .limit(1);

        if (testError) {
          console.error('useOwnGrades: Grades table access test failed:', testError);
          toast({
            variant: "destructive",
            title: "Database Error",
            description: `Cannot access grades table: ${testError.message}`
          });
          return;
        }

        console.log('useOwnGrades: Grades table accessible, found', testData?.length || 0, 'test records');

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
