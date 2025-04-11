
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { mockSubjects } from '../data/mockData';
import { toast } from '@/hooks/use-toast';

export const useOwnGrades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ownGrades, setOwnGrades] = useState<any[]>([]);

  useEffect(() => {
    const fetchOwnGrades = async () => {
      if (user?.role !== 'student') return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*, classes(*)')
          .eq('student_id', user.id);
        
        if (error) {
          console.error("Error fetching grades:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load grades",
          });
          return;
        }
        
        setOwnGrades(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'student') {
      fetchOwnGrades();
    }
  }, [user]);

  const gradesBySubject = ownGrades.reduce<Record<string, any[]>>((acc, grade) => {
    const subject = mockSubjects.find(s => s.id === grade.subject_id);
    if (subject) {
      if (!acc[subject.name]) {
        acc[subject.name] = [];
      }
      acc[subject.name].push(grade);
    }
    return acc;
  }, {});

  return { ownGrades, loading, gradesBySubject };
};
