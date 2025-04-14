
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStudentGrades = (selectedClass: string, selectedSubject: string, selectedExamType: string) => {
  const [loading, setLoading] = useState(false);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [newGradeValues, setNewGradeValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentsWithGrades = async () => {
      if (!selectedClass || !selectedSubject) return;
      
      setLoading(true);
      try {
        // Get students for this class
        const { data: classStudentsData, error: classStudentsError } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', selectedClass);
        
        if (classStudentsError) {
          console.error("Error fetching class students:", classStudentsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load students for this class",
          });
          setStudentGrades([]);
          return;
        }
        
        if (!classStudentsData.length) {
          setStudentGrades([]);
          setLoading(false);
          return;
        }

        // Get student profiles
        const studentIds = classStudentsData.map(cs => cs.student_id);
        
        const { data: studentProfiles, error: studentProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', studentIds);
          
        if (studentProfilesError) {
          console.error("Error fetching student profiles:", studentProfilesError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load student profiles",
          });
          setStudentGrades([]);
          return;
        }

        // Get grades for these students in this subject/exam
        const { data: grades, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('subject_id', selectedSubject)
          .eq('exam_type', selectedExamType)
          .in('student_id', studentIds);
        
        if (gradesError) {
          console.error("Error fetching grades:", gradesError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load grades",
          });
        }

        // Map students with their grades
        const studentsWithGrades = studentProfiles.map(student => {
          const grade = grades?.find(g => g.student_id === student.id);
          
          if (grade?.marks) {
            setNewGradeValues(prev => ({...prev, [student.id]: grade.marks.toString()}));
          }
          
          return {
            id: student.id,
            name: student.full_name || 'Unknown Student',
            role: 'student',
            grade: grade || null
          };
        });
        
        setStudentGrades(studentsWithGrades);
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `An unexpected error occurred: ${error.message}`,
        });
        setStudentGrades([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsWithGrades();
  }, [selectedClass, selectedSubject, selectedExamType, toast]);

  return { studentGrades, loading, newGradeValues, setNewGradeValues };
};
