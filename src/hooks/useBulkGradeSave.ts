
import { useToast } from '@/hooks/use-toast';
import { useGradeValidation } from '@/utils/gradeValidation';
import { useGradeAuthentication } from '@/utils/gradeAuthentication';
import { gradeService } from '@/services/gradeService';

export const useBulkGradeSave = (
  selectedClass: string,
  selectedSubject: string,
  selectedExamType: string,
  newGradeValues: Record<string, string>,
  setNewGradeValues: (values: Record<string, string>) => void,
  newTotalMarks: string,
  user: any,
  onGradesSaved?: () => void
) => {
  const { toast } = useToast();
  const { validateBulkGrades } = useGradeValidation();
  const { validateSession } = useGradeAuthentication();

  const handleBulkSaveGrades = async () => {
    if (!(await validateSession(user))) return;

    if (!validateBulkGrades(selectedClass, selectedSubject, newGradeValues, newTotalMarks)) {
      return;
    }

    const totalMarks = parseFloat(newTotalMarks);
    const studentIds = Object.keys(newGradeValues).filter(id => 
      newGradeValues[id] && newGradeValues[id].trim() !== ''
    );

    try {
      console.log('Bulk grade save: Starting for', studentIds.length, 'students');
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
          console.warn(`Bulk grade save: Invalid marks for student ${studentId}: ${marksValue}`);
          errorCount++;
          continue;
        }

        try {
          const { data: existingGrade, error: fetchError } = await gradeService.checkExistingGrade(
            studentId,
            selectedSubject,
            selectedClass,
            selectedExamType
          );

          if (fetchError) {
            console.error(`Bulk grade save: Error checking existing grade for student ${studentId}:`, fetchError);
            errorCount++;
            continue;
          }

          let error;

          if (existingGrade) {
            const result = await gradeService.updateGrade(existingGrade.id, marks, totalMarks);
            error = result.error;
          } else {
            const result = await gradeService.createGrade({
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
            error = result.error;
          }

          if (error) {
            errorCount++;
            console.error(`Bulk grade save: Error saving grade for student ${studentId}:`, error);
          } else {
            successCount++;
          }
        } catch (gradeError: any) {
          errorCount++;
          console.error(`Bulk grade save: Unexpected error saving grade for student ${studentId}:`, gradeError);
        }
      }

      if (successCount > 0) {
        setNewGradeValues({});

        if (onGradesSaved) {
          await onGradesSaved();
        }

        toast({
          title: "Success",
          description: `${successCount} grades saved successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      } else if (errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save grades. Please check your internet connection and try again.",
        });
      }

    } catch (error: any) {
      console.error("Bulk grade save: Error in bulk save:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while saving grades. Please try again.",
      });
    }
  };

  return {
    handleBulkSaveGrades
  };
};
