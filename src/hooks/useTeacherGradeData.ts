
import { useState } from 'react';
import { useClassData } from '@/hooks/useClassData';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { mockClasses, mockSubjects } from '@/data/mockData';

export const useTeacherGradeData = (user: any) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('midterm');
  
  const { classes } = useClassData();
  
  // Only try to get subjects if we have a selected class and a user
  const subjects = (selectedClass && user) 
    ? getTeacherSubjects(selectedClass, user) 
    : [];
  
  const { studentGrades, loading, newGradeValues, setNewGradeValues } = useStudentGrades(
    selectedClass, 
    selectedSubject, 
    selectedExamType
  );

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
    loading,
    newGradeValues,
    setNewGradeValues
  };
};

function getTeacherSubjects(classId: string, user: any) {
  if (!classId || !user) return [];
  
  // Find the class by ID
  const classObj = mockClasses.find(c => c.id === classId);
  if (!classObj) return [];
  
  // Return subjects that match both the teacher ID and are included in the class
  return mockSubjects.filter(s => 
    s.teacherId === user.id && 
    classObj.subjects.includes(s.id)
  );
}
