
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface TeacherGradeInstructionsProps {
  hasSelectedClass: boolean;
  hasSelectedSubject: boolean;
}

const TeacherGradeInstructions: React.FC<TeacherGradeInstructionsProps> = ({
  hasSelectedClass,
  hasSelectedSubject
}) => {
  if (!hasSelectedClass) {
    return (
      <Alert className="mb-6">
        <AlertTitle>Getting Started with Grade Entry</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Follow these steps to enter student grades:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>First, select a class from the dropdown above</li>
            <li className="opacity-50">Then select a subject you teach</li>
            <li className="opacity-50">Choose an exam type (Midterm, Final, etc.)</li>
            <li className="opacity-50">Enter marks for each student</li>
            <li className="opacity-50">Save individual grades or use "Save All"</li>
          </ol>
        </AlertDescription>
      </Alert>
    );
  } else if (!hasSelectedSubject) {
    return (
      <Alert className="mb-6">
        <AlertTitle>Next Step</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Class selected</li>
            <li>Now, select a subject you teach</li>
            <li className="opacity-50">Choose an exam type</li>
            <li className="opacity-50">Enter marks for each student</li>
            <li className="opacity-50">Save individual grades or use "Save All"</li>
          </ol>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default TeacherGradeInstructions;
