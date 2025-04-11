
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { mockClasses, mockSubjects, mockUsers } from '../data/mockData';
import { toast } from '@/hooks/use-toast';

export const useStudentGrades = (selectedClass: string, selectedSubject: string, selectedExamType: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [newGradeValues, setNewGradeValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStudentsWithGrades = async () => {
      if (!selectedClass || !selectedSubject) return;
      
      setLoading(true);
      try {
        const classObj = mockClasses.find(c => c.id === selectedClass);
        if (!classObj) {
          setStudentGrades([]);
          return;
        }
        
        const studentList = mockUsers
          .filter(u => u.role === 'student' && classObj.students.includes(u.id));
        
        if (!studentList.length) {
          setStudentGrades([]);
          setLoading(false);
          return;
        }

        const { data: grades, error } = await supabase
          .from('grades')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('subject_id', selectedSubject)
          .eq('exam_type', selectedExamType);
        
        if (error) {
          console.error("Error fetching grades:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load grades",
          });
          setStudentGrades([]);
          return;
        }

        const studentsWithGrades = studentList.map(student => {
          const grade = grades?.find(g => g.student_id === student.id);
          
          if (grade?.marks) {
            setNewGradeValues(prev => ({...prev, [student.id]: grade.marks.toString()}));
          }
          
          return {
            ...student,
            grade: grade || null
          };
        });
        
        setStudentGrades(studentsWithGrades);
      } catch (error) {
        console.error("Error:", error);
        setStudentGrades([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsWithGrades();
  }, [selectedClass, selectedSubject, selectedExamType]);

  return { studentGrades, loading, newGradeValues, setNewGradeValues };
};
