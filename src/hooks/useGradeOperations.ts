
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useGradeOperations = (
  selectedClass: string,
  selectedSubject: string, 
  selectedExamType: string,
  newGradeValues: Record<string, string>,
  setNewGradeValues: (values: Record<string, string>) => void,
  newTotalMarks: string,
  user: any
) => {
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  
  const handleGradeInputChange = (studentId: string, value: string) => {
    const updatedValues = { ...newGradeValues, [studentId]: value };
    setNewGradeValues(updatedValues);
  };

  const handleSaveGrade = async (studentId: string) => {
    if (!user || !selectedClass || !selectedSubject) return;
    
    const marksValue = newGradeValues[studentId];
    if (!marksValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return;
    }
    
    const marks = parseFloat(marksValue);
    const totalMarks = parseFloat(newTotalMarks);
    
    if (isNaN(marks) || marks < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return;
    }
    
    if (isNaN(totalMarks) || totalMarks <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid total marks",
      });
      return;
    }
    
    setSavingGrades(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const { data: existingGrade } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject_id', selectedSubject)
        .eq('class_id', selectedClass)
        .eq('exam_type', selectedExamType)
        .maybeSingle();
      
      if (existingGrade) {
        const { error } = await supabase
          .from('grades')
          .update({
            marks,
            total_marks: totalMarks,
            updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX")
          })
          .eq('id', existingGrade.id);
        
        if (error) {
          console.error("Error updating grade:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update grade",
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('grades')
          .insert({
            student_id: studentId,
            subject_id: selectedSubject,
            class_id: selectedClass,
            exam_type: selectedExamType,
            marks,
            total_marks: totalMarks,
            date: format(new Date(), 'yyyy-MM-dd'),
            created_by: user.id
          });
        
        if (error) {
          console.error("Error creating grade:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save grade",
          });
          return;
        }
      }
      
      toast({
        title: "Success",
        description: "Grade has been saved",
      });
    } catch (error) {
      console.error("Error saving grade:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return {
    savingGrades,
    handleGradeInputChange,
    handleSaveGrade
  };
};
