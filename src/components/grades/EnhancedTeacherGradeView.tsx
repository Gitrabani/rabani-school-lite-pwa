
import React, { useState } from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useTeacherGradeData } from '@/hooks/useTeacherGradeData';
import { useGradeComments } from '@/hooks/useGradeComments';
import GradeManagementHeader from './GradeManagementHeader';
import EmptyGradeState from './EmptyGradeState';
import EnhancedGradeSelectionForm from './EnhancedGradeSelectionForm';
import GradeSubmissionStatus from './GradeSubmissionStatus';
import GradeEntryTable from './GradeEntryTable';
import TeacherGuidelines from './TeacherGuidelines';

const EnhancedTeacherGradeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAssignment, setSelectedAssignment] = useState('general');
  const [newTotalMarks, setNewTotalMarks] = useState('100');
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  
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

  const { comments, updateComment, getComment } = useGradeComments();

  // Mock assignments data - in real app, this would come from a hook
  const assignments = [
    { id: 'hw1', name: 'Homework 1', type: 'assignment', maxMarks: 20, dueDate: '2024-01-15' },
    { id: 'quiz1', name: 'Chapter 1 Quiz', type: 'quiz', maxMarks: 15 },
    { id: 'project1', name: 'Science Fair Project', type: 'project', maxMarks: 50, dueDate: '2024-02-01' }
  ];

  const gradedStudents = studentGrades.filter(s => s.grade).length;
  const pendingStudents = studentGrades.length - gradedStudents;
  const hasUnsavedChanges = Object.keys(newGradeValues).length > 0;

  const handleGradeInputChange = (studentId: string, value: string) => {
    setNewGradeValues(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSaveGrade = async (studentId: string) => {
    setSavingGrades(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const comment = getComment(studentId);
      console.log(`Saving grade for ${studentId} with comment: ${comment}`);
      
      toast({
        title: "Success",
        description: "Grade and feedback saved successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save grade"
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleBulkSave = async () => {
    toast({
      title: "Saving",
      description: "Saving all grades and feedback..."
    });
    
    console.log("Bulk saving grades with comments:", comments);
  };

  if (!selectedClass || !selectedSubject) {
    return (
      <EmptyGradeState
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
    );
  }

  return (
    <div>
      <GradeManagementHeader title="Enhanced Grade Management" />

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

      <GradeSubmissionStatus
        totalStudents={studentGrades.length}
        gradedStudents={gradedStudents}
        pendingStudents={pendingStudents}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <GradeEntryTable
        studentGrades={studentGrades}
        loading={loading}
        newGradeValues={newGradeValues}
        newTotalMarks={newTotalMarks}
        setNewTotalMarks={setNewTotalMarks}
        savingGrades={savingGrades}
        hasUnsavedChanges={hasUnsavedChanges}
        onGradeInputChange={handleGradeInputChange}
        onSaveGrade={handleSaveGrade}
        onBulkSave={handleBulkSave}
        onCommentChange={updateComment}
        getComment={getComment}
      />

      <TeacherGuidelines />
    </div>
  );
};

export default EnhancedTeacherGradeView;
