
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedGradeSelectionForm from './EnhancedGradeSelectionForm';

interface EmptyGradeStateProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedExamType: string;
  setSelectedExamType: (value: string) => void;
  selectedAssignment: string;
  setSelectedAssignment: (value: string) => void;
  classes: any[];
  subjects: any[];
  assignments: any[];
}

const EmptyGradeState: React.FC<EmptyGradeStateProps> = ({
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedExamType,
  setSelectedExamType,
  selectedAssignment,
  setSelectedAssignment,
  classes,
  subjects,
  assignments
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Enhanced Grade Management</h2>
      <EnhancedGradeSelectionForm
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedExamType={selectedExamType}
        setSelectedExamType={setSelectedExamType}
        selectedAssignment={selectedAssignment}
        setSelectedAssignment={setSelectedAssignment}
        classes={classes}
        subjects={subjects}
        assignments={assignments}
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Please select a class and subject to begin grading</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyGradeState;
