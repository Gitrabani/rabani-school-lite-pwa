
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
        setChildren([]);
        return;
      }

      try {
        console.log('Fetching children for parent:', parentId);
        
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
          console.error('Error fetching children:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load children information"
          });
          return;
        }

        console.log('Fetched children:', data);
        const childrenList = data?.map(item => ({
          id: item.profiles?.id,
          name: item.profiles?.full_name || 'Unknown',
          role: item.profiles?.role
        })).filter(child => child.id) || [];
        
        setChildren(childrenList);
        
        // Auto-select first child if available
        if (childrenList.length > 0) {
          setSelectedChildId(childrenList[0].id);
        }
      } catch (error: any) {
        console.error('Unexpected error fetching children:', error);
        toast({
          variant: "destructive",
          title: "Error",
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
        setChildGrades([]);
        setGradesBySubject({});
        setSubjects({});
        setReportReady(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching grades for child:', selectedChildId);
        
        const { data, error } = await supabase
          .from('grades')
          .select(`
            *,
            class:class_id (
              name,
              section
            )
          `)
          .eq('student_id', selectedChildId)
          .eq('finalized', true)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching child grades:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load child's grades"
          });
          return;
        }

        console.log('Fetched child grades:', data);
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
          acc[grade.subject_id] = grade.subject_id; // You might want to fetch actual subject names
          return acc;
        }, {});
        setSubjects(subjectsMap);

        // Check if report is ready (simplified logic)
        setReportReady(grades.length > 0);
      } catch (error: any) {
        console.error('Unexpected error fetching child grades:', error);
        toast({
          variant: "destructive",
          title: "Error",
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
