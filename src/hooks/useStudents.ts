
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Student = { 
  id: string; 
  name: string 
};

export const useStudents = (shouldFetch: boolean = true) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!shouldFetch) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching students from profiles...');
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'student')
          .order('full_name');
        
        if (error) {
          console.error("Error fetching students:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to load students: ${error.message}`,
          });
          return;
        }
        
        const studentsList = (profiles || []).map(student => ({
          id: student.id,
          name: student.full_name || 'Unknown'
        }));
        
        console.log(`Fetched ${studentsList.length} students:`, studentsList);
        setStudents(studentsList);
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
    
    fetchStudents();
  }, [shouldFetch, toast]);

  return { students, isLoading };
};
