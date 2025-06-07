
import { useState, useEffect } from 'react';
import { useClassData } from '@/hooks/useClassData';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudentGrades } from '@/hooks/useStudentGrades';

export const useTeacherGradeData = (user: any) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('Midterm');
  const [newGradeValues, setNewGradeValues] = useState<Record<string, string>>({});

  const { classes, loading: classesLoading } = useClassData();
  const { subjects } = useSubjects(selectedClass);
  const { studentGrades, loading, newGradeValues: hookGradeValues, setNewGradeValues: setHookGradeValues, refetchGrades } = useStudentGrades(
    selectedClass,
    selectedSubject,
    selectedExamType
  );

  console.log('Classes:', classes);
  console.log('Selected class:', selectedClass);
  console.log('Subjects:', subjects);
  console.log('Student grades:', studentGrades);

  // Reset subject when class changes
  useEffect(() => {
    setSelectedSubject('');
  }, [selectedClass]);

  // Sync the grade values with the hook
  useEffect(() => {
    setNewGradeValues(hookGradeValues);
  }, [hookGradeValues]);

  return {
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedExamType,
    setSelectedExamType,
    classes,
    subjects,
    studentGrades,
    loading: loading || classesLoading,
    newGradeValues,
    setNewGradeValues: setHookGradeValues,
    refetchGrades // Export the refetch function
  };
};
