
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

/**
 * Utility function to generate random grades data for testing
 */
export const seedGradesData = async () => {
  try {
    // First, check if we have the required data to create sample grades
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name');
      
    if (classesError || !classes || classes.length === 0) {
      toast({
        title: "Error",
        description: "No classes found. Please create classes first.",
        variant: "destructive"
      });
      return false;
    }

    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .limit(10);
      
    if (studentsError || !students || students.length === 0) {
      toast({
        title: "Error",
        description: "No students found. Please create student profiles first.",
        variant: "destructive"
      });
      return false;
    }
    
    // Get subjects from the first class
    const { data: subjects, error: subjectsError } = await supabase
      .from('class_subjects')
      .select('subject_id')
      .eq('class_id', classes[0].id);
      
    if (subjectsError || !subjects || subjects.length === 0) {
      toast({
        title: "Error",
        description: "No subjects found. Please add subjects to a class first.",
        variant: "destructive"
      });
      return false;
    }

    // Generate sample grades
    const gradesData = [];
    const examTypes = ['Midterm', 'Final', 'Quiz', 'Assignment'];
    const classId = classes[0].id;
    
    // Create sample grades for each student
    for (const student of students) {
      // For each subject
      for (const subject of subjects) {
        // For each exam type
        for (const examType of examTypes) {
          // Generate random marks
          const totalMarks = 100;
          const marks = Math.floor(Math.random() * 40) + 60; // Random mark between 60-100
          
          gradesData.push({
            student_id: student.id,
            subject_id: subject.subject_id,
            class_id: classId,
            exam_type: examType,
            marks,
            total_marks: totalMarks,
            date: format(new Date(), 'yyyy-MM-dd'),
            created_by: student.id, // Using student ID as creator for simplicity
            finalized: true
          });
        }
      }
    }

    // Insert the sample grades into the database
    const { error: insertError } = await supabase
      .from('grades')
      .insert(gradesData);

    if (insertError) {
      console.error("Error inserting sample grades:", insertError);
      toast({
        title: "Error",
        description: "Failed to create sample grades data.",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Success",
      description: `Created ${gradesData.length} sample grade records.`
    });
    
    return true;
  } catch (error) {
    console.error("Error generating sample data:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while creating sample data.",
      variant: "destructive"
    });
    return false;
  }
};
