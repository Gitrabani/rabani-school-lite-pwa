
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Class } from '@/types';

export const useClassData = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      const { data, error } = await query;
      
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
      
      console.log("Classes data received:", data);
      
      // Convert the data to match our Class type
      const classesData = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        section: c.section,
        teacherId: c.teacher_id || undefined,
        students: [], // We'll need to fetch these separately or join in the query
        subjects: []  // We'll need to fetch these separately or join in the query
      }));
      
      setClasses(classesData);
    } catch (error: any) {
      console.error("Error:", error);
      setClasses([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message || "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, refetch: fetchClasses };
};
