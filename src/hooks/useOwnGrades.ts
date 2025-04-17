
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/auth/AuthProvider';
import { Student } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useOwnGrades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ownGrades, setOwnGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (!user || user.role !== 'student') return;

        // First get the student's class ID from class_students table
        const { data: studentClassData, error: studentClassError } = await supabase
          .from('class_students')
          .select('class_id')
          .eq('student_id', user.id)
          .single();
        
        if (studentClassError || !studentClassData) {
          console.error("Error fetching student class:", studentClassError);
          return;
        }
        
        const classId = studentClassData.class_id;

        // Then fetch subject information for that class
        const { data, error } = await supabase
          .from('class_subjects')
          .select('subject_id')
          .eq('class_id', classId);
        
        if (error) {
          console.error("Error fetching subjects:", error);
          return;
        }
        
        // Create a map of subject IDs to subject names for easy lookup
        const subjectMap: Record<string, string> = {};
        for (const subject of data || []) {
          // Using subject_id as name for now, can be enhanced later to fetch actual subject names
          subjectMap[subject.subject_id] = subject.subject_id;
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
      if (!user || user.role !== 'student') return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*')
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
