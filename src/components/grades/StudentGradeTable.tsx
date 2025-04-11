
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useGradeOperations } from '@/hooks/useGradeOperations';
import GradeTableHeader from './GradeTableHeader';
import GradeTableContent from './GradeTableContent';

interface StudentGradeTableProps {
  selectedClass: string;
  selectedSubject: string;
  selectedExamType: string;
  studentGrades: any[];
  loading: boolean;
  newGradeValues: Record<string, string>;
  setNewGradeValues: (values: Record<string, string>) => void;
  user: any;
}

const StudentGradeTable: React.FC<StudentGradeTableProps> = ({
  selectedClass,
  selectedSubject,
  selectedExamType,
  studentGrades,
  loading,
  newGradeValues,
  setNewGradeValues,
  user
}) => {
  const [newTotalMarks, setNewTotalMarks] = useState<string>('100');
  const isTeacher = user?.role === 'teacher';
  
  const {
    savingGrades,
    handleGradeInputChange,
    handleSaveGrade
  } = useGradeOperations(
    selectedClass,
    selectedSubject,
    selectedExamType,
    newGradeValues,
    setNewGradeValues,
    newTotalMarks,
    user
  );

  return (
    <Card>
      <GradeTableHeader
        role={user?.role}
        newTotalMarks={newTotalMarks}
        setNewTotalMarks={setNewTotalMarks}
      />
      
      <GradeTableContent
        loading={loading}
        studentGrades={studentGrades}
        newGradeValues={newGradeValues}
        newTotalMarks={newTotalMarks}
        savingGrades={savingGrades}
        isTeacher={isTeacher}
        onGradeInputChange={handleGradeInputChange}
        onSaveGrade={handleSaveGrade}
      />
    </Card>
  );
};

export default StudentGradeTable;
