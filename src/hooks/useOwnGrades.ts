
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useOwnGrades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ownGrades, setOwnGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('class_subjects')
          .select('subject_id, classes!inner(*)')
          .eq('classes.id', user?.class);
        
        if (error) {
          console.error("Error fetching subjects:", error);
          return;
        }
        
        // Create a map of subject IDs to subjects for easy lookup
        const subjectMap: Record<string, string> = {};
        for (const subject of data || []) {
          subjectMap[subject.subject_id] = subject.subject_id; // Using subject_id as name for now
        }
        
        setSubjects(subjectMap);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    if (user?.role === 'student') {
      fetchSubjects();
    }
  }, [user]);

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
    const subjectName = subjects[grade.subject_id] || grade.subject_id || 'Unknown Subject';
    
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(grade);
    
    return acc;
  }, {});

  return { ownGrades, loading, gradesBySubject, subjects };
};
