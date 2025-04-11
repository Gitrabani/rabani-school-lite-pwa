
import React, { useState } from 'react';
import GradeEntryForm from './GradeEntryForm';
import StudentGradeTable from './StudentGradeTable';
import { useClassData } from '@/hooks/useClassData';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { useAuth } from '@/context/AuthContext';

const TeacherGradeView: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('midterm');
  
  const { classes } = useClassData();
  const { studentGrades, loading, newGradeValues, setNewGradeValues } = useStudentGrades(
    selectedClass, 
    selectedSubject, 
    selectedExamType
  );

  return (
    <div>
      <GradeEntryForm
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedExamType={selectedExamType}
        setSelectedExamType={setSelectedExamType}
        classes={classes}
        user={user}
      />
      
      {selectedClass && selectedSubject && (
        <StudentGradeTable
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          selectedExamType={selectedExamType}
          studentGrades={studentGrades}
          loading={loading}
          newGradeValues={newGradeValues}
          setNewGradeValues={setNewGradeValues}
          user={user}
        />
      )}
    </div>
  );
};

export default TeacherGradeView;
