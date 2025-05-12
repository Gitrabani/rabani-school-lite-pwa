
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChildInfo {
  id: string;
  name: string;
}

export const useParentGradeData = (userId: string | undefined) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [childGrades, setChildGrades] = useState<any[]>([]);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [reportReady, setReportReady] = useState(false);

  // Fetch parent's children
  useEffect(() => {
    const fetchChildren = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student')
          .filter('parent_id', 'eq', userId);
          
        if (error) throw error;
        
        const childrenData = data?.map(child => ({
          id: child.id,
          name: child.full_name || 'Unknown Student'
        })) || [];
        
        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching children:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load children data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildren();
  }, [userId, toast]);

  // Fetch selected child's grades
  useEffect(() => {
    const fetchChildGrades = async () => {
      if (!selectedChild) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', selectedChild);
        
        if (error) throw error;
        
        setChildGrades(data || []);
        
        // Process grades by subject
        const bySubject = (data || []).reduce<Record<string, any[]>>((acc, grade) => {
          if (!acc[grade.subject_id]) {
            acc[grade.subject_id] = [];
          }
          acc[grade.subject_id].push(grade);
          return acc;
        }, {});
        
        setGradesBySubject(bySubject);
        
        // Set subjects
        const subjectsMap: Record<string, string> = {};
        (data || []).forEach(grade => {
          subjectsMap[grade.subject_id] = grade.subject_id;
        });
        
        setSubjects(subjectsMap);
      } catch (error: any) {
        console.error('Error fetching child grades:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load grades data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildGrades();
  }, [selectedChild, toast]);

  // Check if report is ready for selected child
  useEffect(() => {
    const checkReportStatus = async () => {
      if (!selectedChild) {
        setReportReady(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('finalized')
          .eq('student_id', selectedChild);
        
        if (error) throw error;
        
        // Report is ready if all grades are finalized
        setReportReady(data && data.length > 0 && data.every(g => g.finalized));
      } catch (error) {
        console.error('Error checking report status:', error);
        setReportReady(false);
      }
    };
    
    checkReportStatus();
  }, [selectedChild, childGrades]);

  return {
    loading,
    children,
    selectedChild,
    setSelectedChild,
    childGrades,
    gradesBySubject,
    subjects,
    reportReady
  };
};
