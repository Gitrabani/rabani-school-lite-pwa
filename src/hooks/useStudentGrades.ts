
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
      setStudentGrades([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching students for class:', selectedClass, 'subject:', selectedSubject, 'exam:', selectedExamType);
      
      // First verify the class exists
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('id', selectedClass)
        .single();

      if (classError) {
        console.error('Error verifying class:', classError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Selected class not found"
        });
        setStudentGrades([]);
        return;
      }

      console.log('Class verified:', classData);

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
      
      if (!classStudentsData || classStudentsData.length === 0) {
        console.log('No students found in this class');
        setStudentGrades([]);
        setLoading(false);
        return;
      }

      // Get student profiles
      const studentIds = classStudentsData.map(cs => cs.student_id);
      console.log('Student IDs:', studentIds);
      
      const { data: studentProfiles, error: studentProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', studentIds)
        .eq('role', 'student');
        
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

      if (!studentProfiles || studentProfiles.length === 0) {
        console.log('No student profiles found');
        setStudentGrades([]);
        setLoading(false);
        return;
      }

      console.log('Found student profiles:', studentProfiles);

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
          title: "Warning",
          description: "Failed to load some grade data",
        });
      }

      console.log('Fetched grades:', grades);

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
      
      console.log('Students with grades:', studentsWithGrades);
      setStudentGrades(studentsWithGrades);
      
      // Clear any existing grade values to show fresh data
      setNewGradeValues({});
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Error",
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
