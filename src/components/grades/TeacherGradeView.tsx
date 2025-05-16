
import React from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import StudentGradeTable from './StudentGradeTable';
import GradeSelectionForm from './GradeSelectionForm';
import { useTeacherGradeData } from '@/hooks/useTeacherGradeData';
import TeacherGradeInstructions from './TeacherGradeInstructions';
import GradeImportDialog from './GradeImportDialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const TeacherGradeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const handleImportGrades = async (importData: any[]) => {
    if (!selectedClass || !selectedSubject || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a class and subject before importing grades"
      });
      return;
    }

    try {
      let successCount = 0;
      let failedCount = 0;

      for (const row of importData) {
        const studentId = row["Student ID"];
        const marks = parseFloat(row["Marks"]);
        const totalMarks = row["Total Marks"] ? parseFloat(row["Total Marks"]) : 100;

        if (!studentId || isNaN(marks) || marks < 0) {
          failedCount++;
          continue;
        }

        // Check if this student is in the selected class
        const studentExists = studentGrades.some(sg => sg.id === studentId);
        if (!studentExists) {
          failedCount++;
          continue;
        }

        // Check if grade already exists
        const { data: existingGrade } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', studentId)
          .eq('subject_id', selectedSubject)
          .eq('class_id', selectedClass)
          .eq('exam_type', selectedExamType)
          .maybeSingle();
          
        let error;
        
        if (existingGrade) {
          // Update existing grade
          const result = await supabase
            .from('grades')
            .update({
              marks,
              total_marks: totalMarks,
              updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX"),
              finalized: true
            })
            .eq('id', existingGrade.id);
          
          error = result.error;
        } else {
          // Create new grade
          const result = await supabase
            .from('grades')
            .insert({
              student_id: studentId,
              subject_id: selectedSubject,
              class_id: selectedClass,
              exam_type: selectedExamType,
              marks,
              total_marks: totalMarks,
              date: format(new Date(), 'yyyy-MM-dd'),
              created_by: user.id,
              finalized: true
            });
          
          error = result.error;
        }
        
        if (error) {
          failedCount++;
          console.error("Error importing grade for student", studentId, error);
        } else {
          successCount++;
          // Also update the local state
          setNewGradeValues(prev => ({...prev, [studentId]: marks.toString()}));
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} grades${failedCount > 0 ? `, ${failedCount} failed` : ''}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "No grades were imported. Please check your CSV file format."
        });
      }
      
    } catch (error: any) {
      console.error("Error importing grades:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "An error occurred while importing grades"
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Teacher Grade Management</h2>
        {selectedClass && selectedSubject && (
          <GradeImportDialog onImport={handleImportGrades} />
        )}
      </div>
      
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
              <li>Export grades to CSV using the "Export CSV" button</li>
              <li>Import grades from CSV using the "Import Grades" button</li>
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
