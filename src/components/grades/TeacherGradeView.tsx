
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentGradeTable from './StudentGradeTable';
import GradeSelectionForm from './GradeSelectionForm';
import { useTeacherGradeData } from '@/hooks/useTeacherGradeData';

const TeacherGradeView: React.FC = () => {
  const { user } = useAuth();
  const {
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
  } = useTeacherGradeData(user);

  return (
    <div>
      <GradeSelectionForm
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedExamType={selectedExamType}
        setSelectedExamType={setSelectedExamType}
        classes={classes}
        subjects={subjects}
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
