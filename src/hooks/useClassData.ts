
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types';

export const useClassData = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        setClasses([]);
        setLoading(false);
        return;
      }
      
      console.log("Fetching classes for user role:", user.role);
      let query = supabase.from('classes').select('*');
      
      if (user?.role === 'teacher') {
        query = query.eq('teacher_id', user.id);
      }
      
      const { data: classesData, error } = await query;
      
      if (error) {
        console.error("Error fetching classes:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load classes: ${error.message}`,
        });
        setClasses([]);
        return;
      }
      
      // Convert the data to match our Class type
      const fetchedClasses: Class[] = [];
      
      // Process each class
      for (const classItem of classesData) {
        // Fetch students for this class
        const { data: studentData, error: studentError } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', classItem.id);
          
        if (studentError) {
          console.error("Error fetching students:", studentError);
        }
        
        // Fetch subjects for this class
        const { data: subjectData, error: subjectError } = await supabase
          .from('class_subjects')
          .select('subject_id')
          .eq('class_id', classItem.id);
          
        if (subjectError) {
          console.error("Error fetching subjects:", subjectError);
        }
        
        // Create the class object with real data
        fetchedClasses.push({
          id: classItem.id,
          name: classItem.name,
          section: classItem.section,
          teacherId: classItem.teacher_id || undefined,
          students: studentData ? studentData.map(s => s.student_id) : [],
          subjects: subjectData ? subjectData.map(s => s.subject_id) : []
        });
      }
      
      setClasses(fetchedClasses);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message || "Unknown error"}`,
      });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, refetch: fetchClasses };
};
