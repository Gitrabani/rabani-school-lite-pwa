
import React from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import StudentGradeTable from './StudentGradeTable';
import GradeSelectionForm from './GradeSelectionForm';
import { useTeacherGradeData } from '@/hooks/useTeacherGradeData';
import TeacherGradeInstructions from './TeacherGradeInstructions';
import { Separator } from '@/components/ui/separator';

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
      
      <TeacherGradeInstructions 
        hasSelectedClass={!!selectedClass} 
        hasSelectedSubject={!!selectedSubject} 
      />
      
      {selectedClass && selectedSubject && (
        <>
          <h3 className="text-lg font-medium mb-4">
            Enter grades for {subjects.find(s => s.id === selectedSubject)?.name || 'Selected Subject'} - {selectedExamType}
          </h3>
          
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
          
          <Separator className="my-8" />
          
          <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
            <p className="font-medium mb-2">Notes for teachers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You can save each student's grade individually using the "Save" button</li>
              <li>Or use the "Save All" button to save all entered grades at once</li>
              <li>Saved grades will be visible to students and their parents</li>
              <li>Admins can view grade reports based on these entries</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherGradeView;
