
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

export const useClassStudents = (classId: string) => {
  const [students, setStudents] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchClassStudents = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching students for class:", classId);
      
      const { data: classStudentsData, error: classStudentsError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);

      if (classStudentsError) {
        console.error("Error fetching class students:", classStudentsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students for this class.",
        });
        return;
      }

      console.log("Class students data:", classStudentsData);
      const studentIds = classStudentsData.map(cs => cs.student_id);
      
      if (studentIds.length > 0) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', studentIds)
          .eq('role', 'student');
          
        if (studentsError) {
          console.error("Error fetching student profiles:", studentsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load student details.",
          });
          return;
        }

        console.log("Students data:", studentsData);
        const formattedStudents = studentsData.map(student => ({
          id: student.id,
          name: student.full_name || 'Unknown',
          email: '',
          role: 'student' as const,
          profileImage: student.avatar_url || undefined
        }));

        setStudents(formattedStudents);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      console.log("Fetching available students not in class:", classId);
      
      const { data: classStudentsData, error: classStudentsError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);

      if (classStudentsError) {
        console.error("Error fetching class students:", classStudentsError);
        return;
      }

      const existingStudentIds = classStudentsData.map(cs => cs.student_id);
      console.log("Existing student IDs in this class:", existingStudentIds);
      
      const { data: availableStudentsData, error: availableStudentsError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'student');
        
      if (availableStudentsError) {
        console.error("Error fetching available students:", availableStudentsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load available students.",
        });
        return;
      }

      console.log("All student profiles:", availableStudentsData);
      
      const filteredStudents = availableStudentsData.filter(student => 
        !existingStudentIds.includes(student.id)
      );

      console.log("Filtered available students:", filteredStudents);
      
      const formattedStudents = filteredStudents.map(student => ({
        id: student.id,
        name: student.full_name || 'Unknown',
        email: '',
        role: 'student' as const,
        profileImage: student.avatar_url || undefined
      }));

      setAvailableStudents(formattedStudents);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  const addStudent = async (studentId: string) => {
    try {
      console.log("Adding student to class. Student ID:", studentId, "Class ID:", classId);
      
      const { data, error } = await supabase
        .from('class_students')
        .insert({ class_id: classId, student_id: studentId })
        .select();

      if (error) {
        console.error("Error adding student to class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add student to class.",
        });
        return false;
      }

      console.log("Student added successfully:", data);
      
      const student = availableStudents.find(s => s.id === studentId);
      if (student) {
        setStudents(prev => [...prev, student]);
        setAvailableStudents(prev => prev.filter(s => s.id !== studentId));
      }

      toast({
        title: "Success",
        description: "Student added to class successfully.",
      });

      return true;
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
      return false;
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      console.log("Removing student from class. Student ID:", studentId, "Class ID:", classId);
      
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) {
        console.error("Error removing student from class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove student from class.",
        });
        return false;
      }

      setStudents(prev => prev.filter(s => s.id !== studentId));
      
      toast({
        title: "Success",
        description: "Student removed from class successfully.",
      });

      return true;
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
      return false;
    }
  };

  return {
    students,
    availableStudents,
    isLoading,
    fetchClassStudents,
    fetchAvailableStudents,
    addStudent,
    removeStudent
  };
};
