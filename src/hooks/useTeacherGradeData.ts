
import { useState } from 'react';
import { useClassData } from '@/hooks/useClassData';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { mockClasses, mockSubjects } from '@/data/mockData';

export const useTeacherGradeData = (user: any) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('midterm');
  
  const { classes } = useClassData();
  
  const subjects = selectedClass ? getTeacherSubjects(selectedClass, user) : [];
  
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
  
  const classObj = mockClasses.find(c => c.id === classId);
  if (!classObj) return [];
  
  return mockSubjects.filter(s => 
    s.teacherId === user.id && 
    classObj.subjects.includes(s.id)
  );
}
