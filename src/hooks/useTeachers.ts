
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Teacher = { 
  id: string; 
  name: string 
};

export const useTeachers = (shouldFetch: boolean = true) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!shouldFetch) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching teachers from profiles...');
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'teacher')
          .order('full_name');
        
        if (error) {
          console.error("Error fetching teachers:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to load teachers: ${error.message}`,
          });
          return;
        }
        
        const teachersList = (profiles || []).map(teacher => ({
          id: teacher.id,
          name: teacher.full_name || 'Unknown'
        }));
        
        console.log(`Fetched ${teachersList.length} teachers:`, teachersList);
        setTeachers(teachersList);
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `An unexpected error occurred: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeachers();
  }, [shouldFetch, toast]);

  return { teachers, isLoading };
};
