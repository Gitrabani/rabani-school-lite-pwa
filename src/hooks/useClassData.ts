
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useClassData = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        if (!user) {
          setClasses([]);
          setLoading(false);
          return;
        }
        
        let query = supabase.from('classes').select('*');
        
        if (user?.role === 'teacher') {
          query = query.eq('teacher_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classes",
          });
          return;
        }
        
        setClasses(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [user]);

  return { classes, loading };
};
