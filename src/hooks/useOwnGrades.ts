
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOwnGrades = (userId: string | undefined) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGrades = async () => {
      if (!userId) {
        setGrades([]);
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
        setGrades(data || []);
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

  return { grades, loading };
};
