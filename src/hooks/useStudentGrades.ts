
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStudentGrades = (selectedClass: string, selectedSubject: string, selectedExamType: string) => {
  const [loading, setLoading] = useState(false);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [newGradeValues, setNewGradeValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchStudentsWithGrades = useCallback(async () => {
    if (!selectedClass || !selectedSubject) {
      console.log('useStudentGrades: Missing class or subject, clearing data');
      setStudentGrades([]);
      return;
    }

    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.log('useStudentGrades: No active session, skipping fetch');
      // Clear state when not authenticated
      setStudentGrades([]);
      return;
    }
    
    setLoading(true);
    console.log('useStudentGrades: Starting fetch for class:', selectedClass, 'subject:', selectedSubject, 'exam:', selectedExamType);
    
    try {
      // Get students for this class
      const { data: classStudentsData, error: classStudentsError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', selectedClass);
      
      if (classStudentsError) {
        console.error("useStudentGrades: Error fetching class students:", classStudentsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load students for this class: ${classStudentsError.message}`,
        });
        setStudentGrades([]);
        return;
      }
      
      if (!classStudentsData || classStudentsData.length === 0) {
        console.log('useStudentGrades: No students found in this class');
        setStudentGrades([]);
        setLoading(false);
        return;
      }

      const studentIds = classStudentsData.map(cs => cs.student_id);
      console.log('useStudentGrades: Found student IDs:', studentIds);
      
      // Get student profiles
      const { data: studentProfiles, error: studentProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', studentIds)
        .eq('role', 'student');
        
      if (studentProfilesError) {
        console.error("useStudentGrades: Error fetching student profiles:", studentProfilesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load student profiles: ${studentProfilesError.message}`,
        });
        setStudentGrades([]);
        return;
      }

      if (!studentProfiles || studentProfiles.length === 0) {
        console.log('useStudentGrades: No student profiles found');
        setStudentGrades([]);
        setLoading(false);
        return;
      }

      console.log('useStudentGrades: Found student profiles:', studentProfiles);

      // Get grades for these students in this subject/exam
      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('subject_id', selectedSubject)
        .eq('exam_type', selectedExamType)
        .in('student_id', studentIds);
      
      if (gradesError) {
        console.error("useStudentGrades: Error fetching grades:", gradesError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: `Failed to load some grade data: ${gradesError.message}`,
        });
      }

      console.log('useStudentGrades: Fetched grades:', grades?.length || 0, 'records');

      // Map students with their grades
      const studentsWithGrades = studentProfiles.map(student => {
        const grade = grades?.find(g => g.student_id === student.id);
        
        return {
          id: student.id,
          name: student.full_name || 'Unknown Student',
          role: 'student',
          grade: grade || null
        };
      });
      
      console.log('useStudentGrades: Final students with grades:', studentsWithGrades);
      setStudentGrades(studentsWithGrades);
      
      // Clear any existing grade values to show fresh data
      setNewGradeValues({});

    } catch (error: any) {
      console.error("useStudentGrades: Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Unexpected Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
      setStudentGrades([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSubject, selectedExamType, toast]);

  useEffect(() => {
    fetchStudentsWithGrades();
  }, [fetchStudentsWithGrades]);

  return { 
    studentGrades, 
    loading, 
    newGradeValues, 
    setNewGradeValues,
    refetchGrades: fetchStudentsWithGrades
  };
};
