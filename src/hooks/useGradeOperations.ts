
import { useState } from 'react';
import { useIndividualGradeSave } from './useIndividualGradeSave';
import { useBulkGradeSave } from './useBulkGradeSave';

export const useGradeOperations = (
  selectedClass: string,
  selectedSubject: string, 
  selectedExamType: string,
  newGradeValues: Record<string, string>,
  setNewGradeValues: (values: Record<string, string>) => void,
  newTotalMarks: string,
  user: any,
  onGradesSaved?: () => void
) => {
  const handleGradeInputChange = (studentId: string, value: string) => {
    const updatedValues = { ...newGradeValues, [studentId]: value };
    setNewGradeValues(updatedValues);
  };

  const { savingGrades, handleSaveGrade } = useIndividualGradeSave(
    selectedClass,
    selectedSubject,
    selectedExamType,
    newGradeValues,
    setNewGradeValues,
    newTotalMarks,
    user,
    onGradesSaved
  );

  const { handleBulkSaveGrades } = useBulkGradeSave(
    selectedClass,
    selectedSubject,
    selectedExamType,
    newGradeValues,
    setNewGradeValues,
    newTotalMarks,
    user,
    onGradesSaved
  );

  return {
    savingGrades,
    handleGradeInputChange,
    handleSaveGrade,
    handleBulkSaveGrades
  };
};
