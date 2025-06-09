
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGradeValidation } from '@/utils/gradeValidation';
import { useGradeAuthentication } from '@/utils/gradeAuthentication';
import { gradeService } from '@/services/gradeService';

export const useIndividualGradeSave = (
  selectedClass: string,
  selectedSubject: string,
  selectedExamType: string,
  newGradeValues: Record<string, string>,
  setNewGradeValues: (values: Record<string, string>) => void,
  newTotalMarks: string,
  user: any,
  onGradesSaved?: () => void
) => {
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { validateGradeInput } = useGradeValidation();
  const { validateSession } = useGradeAuthentication();

  const handleSaveGrade = async (studentId: string) => {
    if (!(await validateSession(user))) return;

    const marksValue = newGradeValues[studentId];
    if (!validateGradeInput(selectedClass, selectedSubject, marksValue, newTotalMarks)) {
      return;
    }

    const marks = parseFloat(marksValue);
    const totalMarks = parseFloat(newTotalMarks);

    setSavingGrades(prev => ({ ...prev, [studentId]: true }));

    try {
      console.log('Individual grade save: Starting for student:', studentId);

      const { data: existingGrade, error: fetchError } = await gradeService.checkExistingGrade(
        studentId,
        selectedSubject,
        selectedClass,
        selectedExamType
      );

      if (fetchError) {
        console.error("Individual grade save: Error checking existing grade:", fetchError);
        throw new Error(`Failed to check existing grade: ${fetchError.message}`);
      }

      if (existingGrade) {
        const { error } = await gradeService.updateGrade(existingGrade.id, marks, totalMarks);
        if (error) {
          console.error("Individual grade save: Error updating grade:", error);
          throw new Error(`Failed to update grade: ${error.message}`);
        }
      } else {
        const { error } = await gradeService.createGrade({
          student_id: studentId,
          subject_id: selectedSubject,
          class_id: selectedClass,
          exam_type: selectedExamType,
          marks,
          total_marks: totalMarks,
          date: '',
          created_by: user.id,
          finalized: true,
        });

        if (error) {
          console.error("Individual grade save: Error creating grade:", error);
          throw new Error(`Failed to create grade: ${error.message}`);
        }
      }

      // Clear the input value for this student
      const updatedValues = { ...newGradeValues };
      delete updatedValues[studentId];
      setNewGradeValues(updatedValues);

      if (onGradesSaved) {
        await onGradesSaved();
      }

      toast({
        title: "Success",
        description: "Grade has been saved successfully",
      });
    } catch (error: any) {
      console.error("Individual grade save: Error saving grade:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save grade. Please check your internet connection and try again.",
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return {
    savingGrades,
    handleSaveGrade
  };
};
