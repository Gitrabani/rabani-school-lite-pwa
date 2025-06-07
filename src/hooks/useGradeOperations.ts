
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGradeOperations = (
  selectedClass: string,
  selectedSubject: string, 
  selectedExamType: string,
  newGradeValues: Record<string, string>,
  setNewGradeValues: (values: Record<string, string>) => void,
  newTotalMarks: string,
  user: any,
  onGradesSaved?: () => void // Add callback to refresh data
) => {
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  const handleGradeInputChange = (studentId: string, value: string) => {
    const updatedValues = { ...newGradeValues, [studentId]: value };
    setNewGradeValues(updatedValues);
  };

  const handleBulkSaveGrades = async () => {
    if (!user || !selectedClass || !selectedSubject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Class and subject must be selected",
      });
      return;
    }
    
    const totalMarks = parseFloat(newTotalMarks);
    
    if (isNaN(totalMarks) || totalMarks <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid total marks",
      });
      return;
    }
    
    const studentIds = Object.keys(newGradeValues).filter(id => newGradeValues[id] && newGradeValues[id].trim() !== '');
    
    if (studentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No grades to save",
      });
      return;
    }
    
    try {
      toast({
        title: "Saving",
        description: `Saving ${studentIds.length} grades...`,
      });
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const studentId of studentIds) {
        const marksValue = newGradeValues[studentId];
        if (!marksValue || marksValue.trim() === '') continue;
        
        const marks = parseFloat(marksValue);
        if (isNaN(marks) || marks < 0) {
          console.warn(`Invalid marks for student ${studentId}: ${marksValue}`);
          continue;
        }
        
        // Check if grade already exists
        const { data: existingGrade, error: fetchError } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', studentId)
          .eq('subject_id', selectedSubject)
          .eq('class_id', selectedClass)
          .eq('exam_type', selectedExamType)
          .maybeSingle();
        
        if (fetchError) {
          console.error(`Error checking existing grade for student ${studentId}:`, fetchError);
          errorCount++;
          continue;
        }
        
        let error;
        
        if (existingGrade) {
          // Update existing grade
          const { error: updateError } = await supabase
            .from('grades')
            .update({
              marks,
              total_marks: totalMarks,
              updated_at: new Date().toISOString(),
              finalized: true
            })
            .eq('id', existingGrade.id);
          
          error = updateError;
        } else {
          // Insert new grade
          const { error: insertError } = await supabase
            .from('grades')
            .insert({
              student_id: studentId,
              subject_id: selectedSubject,
              class_id: selectedClass,
              exam_type: selectedExamType,
              marks,
              total_marks: totalMarks,
              date: format(new Date(), 'yyyy-MM-dd'),
              created_by: user.id,
              finalized: true,
            });
          
          error = insertError;
        }
        
        if (error) {
          errorCount++;
          console.error(`Error saving grade for student ${studentId}:`, error);
        } else {
          successCount++;
        }
      }
      
      // Clear the input values after successful save
      if (successCount > 0) {
        setNewGradeValues({});
        
        // Call refresh callback if provided
        if (onGradesSaved) {
          onGradesSaved();
        }
        
        toast({
          title: "Success",
          description: `${successCount} grades saved successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      } else if (errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save grades. Please check the console for details.",
        });
      }
      
    } catch (error) {
      console.error("Error bulk saving grades:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while saving grades",
      });
    }
  };

  const handleSaveGrade = async (studentId: string) => {
    if (!user || !selectedClass || !selectedSubject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Class and subject must be selected",
      });
      return;
    }
    
    const marksValue = newGradeValues[studentId];
    if (!marksValue || marksValue.trim() === '') {
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
      // Check if grade already exists
      const { data: existingGrade, error: fetchError } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject_id', selectedSubject)
        .eq('class_id', selectedClass)
        .eq('exam_type', selectedExamType)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error checking existing grade:", fetchError);
        throw fetchError;
      }
      
      if (existingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from('grades')
          .update({
            marks,
            total_marks: totalMarks,
            updated_at: new Date().toISOString(),
            finalized: true
          })
          .eq('id', existingGrade.id);
        
        if (error) {
          console.error("Error updating grade:", error);
          throw error;
        }
      } else {
        // Insert new grade
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
            created_by: user.id,
            finalized: true,
          });
        
        if (error) {
          console.error("Error creating grade:", error);
          throw error;
        }
      }
      
      // Clear the input value for this student
      const updatedValues = { ...newGradeValues };
      delete updatedValues[studentId];
      setNewGradeValues(updatedValues);
      
      // Call refresh callback if provided
      if (onGradesSaved) {
        onGradesSaved();
      }
      
      toast({
        title: "Success",
        description: "Grade has been saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving grade:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save grade",
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return {
    savingGrades,
    handleGradeInputChange,
    handleSaveGrade,
    handleBulkSaveGrades
  };
};
