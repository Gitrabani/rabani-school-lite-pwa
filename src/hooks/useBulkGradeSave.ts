
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
      console.log('Bulk grade save: Starting secure atomic operation for', studentIds.length, 'students');
      toast({
        title: "Saving Securely",
        description: `Processing ${studentIds.length} grades with full security validation...`,
      });

      // Prepare data for atomic bulk operation
      const newGrades: any[] = [];
      const gradeUpdates: any[] = [];

      // Check existing grades and prepare operations
      for (const studentId of studentIds) {
        const marksValue = newGradeValues[studentId];
        if (!marksValue || marksValue.trim() === '') continue;

        const marks = parseFloat(marksValue);
        if (isNaN(marks) || marks < 0) {
          console.warn(`Bulk grade save: Invalid marks for student ${studentId}: ${marksValue}`);
          continue;
        }

        // Check if grade exists
        const { data: existingGrade, error: fetchError } = await gradeService.checkExistingGrade(
          studentId,
          selectedSubject,
          selectedClass,
          selectedExamType
        );

        if (fetchError) {
          console.error(`Bulk grade save: Error checking existing grade for student ${studentId}:`, fetchError);
          continue;
        }

        if (existingGrade) {
          gradeUpdates.push({
            id: existingGrade.id,
            marks,
            total_marks: totalMarks
          });
        } else {
          newGrades.push({
            student_id: studentId,
            subject_id: selectedSubject,
            class_id: selectedClass,
            exam_type: selectedExamType,
            marks,
            total_marks: totalMarks,
            created_by: user.id,
            finalized: true,
          });
        }
      }

      // Execute atomic bulk operation
      const result = await gradeService.bulkSaveGrades(newGrades, gradeUpdates);

      if (result.success) {
        // Clear input values on success
        setNewGradeValues({});

        // Refresh data
        if (onGradesSaved) {
          await onGradesSaved();
        }

        toast({
          title: "Secure Save Complete",
          description: `Successfully saved ${result.insertedCount + result.updatedCount} grades with full security validation`,
        });

        console.log(`Bulk grade save: Securely saved ${result.insertedCount} new grades and updated ${result.updatedCount} existing grades`);
      }

    } catch (error: any) {
      console.error("Bulk grade save: Secure operation failed:", error);
      toast({
        variant: "destructive",
        title: "Secure Save Failed",
        description: "Failed to save grades securely. Please verify your permissions and try again.",
      });
    }
  };

  return {
    handleBulkSaveGrades
  };
};
