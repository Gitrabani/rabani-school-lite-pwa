
import { useToast } from '@/hooks/use-toast';

export const useGradeValidation = () => {
  const { toast } = useToast();

  const validateGradeInput = (
    selectedClass: string,
    selectedSubject: string,
    marksValue: string,
    totalMarks: string
  ) => {
    if (!selectedClass || !selectedSubject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Class and subject must be selected",
      });
      return false;
    }

    if (!marksValue || marksValue.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return false;
    }

    const marks = parseFloat(marksValue);
    const total = parseFloat(totalMarks);

    if (isNaN(marks) || marks < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return false;
    }

    if (isNaN(total) || total <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid total marks",
      });
      return false;
    }

    return true;
  };

  const validateBulkGrades = (
    selectedClass: string,
    selectedSubject: string,
    newGradeValues: Record<string, string>,
    newTotalMarks: string
  ) => {
    if (!selectedClass || !selectedSubject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Class and subject must be selected",
      });
      return false;
    }

    const totalMarks = parseFloat(newTotalMarks);

    if (isNaN(totalMarks) || totalMarks <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid total marks",
      });
      return false;
    }

    const studentIds = Object.keys(newGradeValues).filter(id => 
      newGradeValues[id] && newGradeValues[id].trim() !== ''
    );

    if (studentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No grades to save",
      });
      return false;
    }

    return true;
  };

  return {
    validateGradeInput,
    validateBulkGrades
  };
};
