
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useParentGradeData = (parentId: string | undefined) => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childGrades, setChildGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [reportReady, setReportReady] = useState(false);
  const { toast } = useToast();

  // Fetch children for the parent
  useEffect(() => {
    const fetchChildren = async () => {
      if (!parentId) {
        console.log('useParentGradeData: No parentId provided, skipping fetch');
        setChildren([]);
        return;
      }

      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.log('useParentGradeData: No active session, skipping fetch');
        return;
      }

      if (session.user.id !== parentId) {
        console.log('useParentGradeData: Session user ID does not match provided parentId');
        return;
      }

      console.log('useParentGradeData: Starting children fetch for parent:', parentId);

      try {
        // First verify the parent exists
        const { data: parentProfile, error: parentError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', parentId)
          .single();

        if (parentError) {
          console.error('useParentGradeData: Parent profile fetch error:', parentError);
          if (parentError.code === 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Parent Profile Not Found",
              description: "Parent profile not found in the system"
            });
          } else {
            toast({
              variant: "destructive",
              title: "Profile Error",
              description: `Failed to verify parent profile: ${parentError.message}`
            });
          }
          return;
        }

        console.log('useParentGradeData: Parent profile verified:', parentProfile);

        // Test access to parent_child_relationships table
        const { data: testRelData, error: testRelError } = await supabase
          .from('parent_child_relationships')
          .select('id')
          .limit(1);

        if (testRelError) {
          console.error('useParentGradeData: Parent-child relationships table access test failed:', testRelError);
          toast({
            variant: "destructive",
            title: "Database Error",
            description: `Cannot access parent-child relationships: ${testRelError.message}`
          });
          return;
        }

        console.log('useParentGradeData: Parent-child relationships table accessible');

        // Fetch children relationships with explicit column reference
        const { data, error } = await supabase
          .from('parent_child_relationships')
          .select(`
            child_id,
            profiles!parent_child_relationships_child_id_fkey (
              id,
              full_name,
              role
            )
          `)
          .eq('parent_id', parentId);

        if (error) {
          console.error('useParentGradeData: Children fetch error:', error);
          toast({
            variant: "destructive",
            title: "Error Loading Children",
            description: `Failed to load children: ${error.message}`
          });
          return;
        }

        console.log('useParentGradeData: Raw children data:', data);
        
        const childrenList = data?.map(item => ({
          id: item.profiles?.id,
          name: item.profiles?.full_name || 'Unknown',
          role: item.profiles?.role
        })).filter(child => child.id) || [];
        
        console.log('useParentGradeData: Processed children list:', childrenList);
        setChildren(childrenList);
        
        // Auto-select first child if available
        if (childrenList.length > 0) {
          setSelectedChildId(childrenList[0].id);
        }

      } catch (error: any) {
        console.error('useParentGradeData: Unexpected error fetching children:', error);
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: `Failed to load children: ${error.message}`
        });
      }
    };

    fetchChildren();
  }, [parentId, toast]);

  // Fetch grades for selected child
  useEffect(() => {
    const fetchChildGrades = async () => {
      if (!selectedChildId) {
        console.log('useParentGradeData: No selectedChildId, clearing grades');
        setChildGrades([]);
        setGradesBySubject({});
        setSubjects({});
        setReportReady(false);
        return;
      }

      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.log('useParentGradeData: No active session for child grades fetch');
        return;
      }

      setLoading(true);
      console.log('useParentGradeData: Starting grades fetch for child:', selectedChildId);
      
      try {
        // Verify we can access grades table
        const { data: testGradesData, error: testGradesError } = await supabase
          .from('grades')
          .select('id')
          .limit(1);

        if (testGradesError) {
          console.error('useParentGradeData: Grades table access test failed:', testGradesError);
          toast({
            variant: "destructive",
            title: "Database Error",
            description: `Cannot access grades table: ${testGradesError.message}`
          });
          return;
        }

        console.log('useParentGradeData: Grades table accessible for child grades');

        const { data, error } = await supabase
          .from('grades')
          .select(`
            *,
            classes!inner(
              name,
              section
            )
          `)
          .eq('student_id', selectedChildId)
          .eq('finalized', true)
          .order('date', { ascending: false });

        if (error) {
          console.error('useParentGradeData: Child grades fetch error:', error);
          toast({
            variant: "destructive",
            title: "Error Loading Child Grades",
            description: `Failed to load child's grades: ${error.message}`
          });
          return;
        }

        console.log('useParentGradeData: Successfully fetched child grades:', data?.length || 0, 'records');
        const grades = data || [];
        setChildGrades(grades);

        // Group grades by subject
        const gradesBySubj = grades.reduce((acc: Record<string, any[]>, grade: any) => {
          if (!acc[grade.subject_id]) {
            acc[grade.subject_id] = [];
          }
          acc[grade.subject_id].push(grade);
          return acc;
        }, {});
        setGradesBySubject(gradesBySubj);

        // Create subjects map
        const subjectsMap = grades.reduce((acc: Record<string, string>, grade: any) => {
          acc[grade.subject_id] = grade.subject_id;
          return acc;
        }, {});
        setSubjects(subjectsMap);

        // Check if report is ready
        setReportReady(grades.length > 0);

      } catch (error: any) {
        console.error('useParentGradeData: Unexpected error fetching child grades:', error);
        toast({
          variant: "destructive",
          title: "Unexpected Error",
          description: `Failed to load grades: ${error.message}`
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChildGrades();
  }, [selectedChildId, toast]);

  return {
    children,
    selectedChild: selectedChildId,
    setSelectedChild: setSelectedChildId,
    selectedChildId,
    setSelectedChildId,
    childGrades,
    gradesBySubject,
    subjects,
    reportReady,
    loading
  };
};
