
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useGradeOperations } from '@/hooks/useGradeOperations';
import GradeTableHeader from './GradeTableHeader';
import GradeTableContent from './GradeTableContent';
import { convertGradesToCSV, downloadCSV } from '@/utils/gradesCsvUtils';
import { format } from 'date-fns';

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
    handleSaveGrade,
    handleBulkSaveGrades
  } = useGradeOperations(
    selectedClass,
    selectedSubject,
    selectedExamType,
    newGradeValues,
    setNewGradeValues,
    newTotalMarks,
    user
  );

  const handleExportCSV = () => {
    if (!selectedSubject || !selectedExamType) return;
    
    const csvContent = convertGradesToCSV(studentGrades, selectedSubject, selectedExamType);
    const fileName = `grades_${selectedSubject}_${selectedExamType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadCSV(csvContent, fileName);
  };

  return (
    <Card>
      <GradeTableHeader
        role={user?.role}
        newTotalMarks={newTotalMarks}
        setNewTotalMarks={setNewTotalMarks}
        onBulkSave={isTeacher ? handleBulkSaveGrades : undefined}
        onExportCSV={isTeacher ? handleExportCSV : undefined}
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
