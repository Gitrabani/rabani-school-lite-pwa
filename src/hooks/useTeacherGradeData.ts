
import { useState, useEffect } from 'react';
import { useClassData } from '@/hooks/useClassData';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types';

export const useTeacherGradeData = (user: any) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('midterm');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const { classes } = useClassData();
  
  const { studentGrades, loading, newGradeValues, setNewGradeValues } = useStudentGrades(
    selectedClass, 
    selectedSubject, 
    selectedExamType
  );

  // Fetch subjects when selected class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass || !user) return;
      
      try {
        // Get subjects for this class
        const { data: classSubjectsData, error } = await supabase
          .from('class_subjects')
          .select('subject_id')
          .eq('class_id', selectedClass);
        
        if (error) {
          console.error("Error fetching class subjects:", error);
          return;
        }
        
        // Format subjects data
        const teacherSubjects = classSubjectsData.map(item => ({
          id: item.subject_id,
          name: item.subject_id, // Using ID as name since we don't have a subjects table
          teacherId: user.id,
          classes: [selectedClass]
        }));
        
        setSubjects(teacherSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      }
    };
    
    fetchSubjects();
  }, [selectedClass, user]);

  return {
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedExamType,
    setSelectedExamType,
    classes,
    subjects,
    studentGrades,
    loading,
    newGradeValues,
    setNewGradeValues
  };
};
