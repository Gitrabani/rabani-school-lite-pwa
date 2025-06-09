
import React from 'react';
import { useTeacherGradeData } from '@/hooks/useTeacherGradeData';
import { useAuth } from '@/context/auth/AuthProvider';
import GradeSelectionForm from './GradeSelectionForm';
import StudentGradeTable from './StudentGradeTable';
import GradeManagementHeader from './GradeManagementHeader';
import GradeImportDialog from './GradeImportDialog';
import ReportCardUploadDialog from './ReportCardUploadDialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { convertGradesToCSV, downloadCSV } from '@/utils/gradesCsvUtils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { gradeService } from '@/services/gradeService';

const EnhancedTeacherGradeView: React.FC = () => {
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
    setNewGradeValues,
    refetchGrades
  } = useTeacherGradeData(user);

  const handleImportGrades = async (importData: any[]) => {
    if (!selectedClass || !selectedSubject || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select class and subject before importing"
      });
      return;
    }

    try {
      const gradesData = importData.map(row => ({
        student_id: row['Student ID'],
        subject_id: selectedSubject,
        class_id: selectedClass,
        exam_type: selectedExamType,
        marks: parseFloat(row['Marks']),
        total_marks: parseFloat(row['Total Marks'] || '100'),
        date: format(new Date(), 'yyyy-MM-dd'),
        created_by: user.id,
        finalized: true,
      }));

      const result = await gradeService.bulkSaveGrades(gradesData, []);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `${result.insertedCount} grades imported successfully`
        });
        await refetchGrades();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "Failed to import grades"
      });
    }
  };

  const handleExportGrades = () => {
    if (!selectedSubject || !selectedExamType || studentGrades.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Error",
        description: "No grades to export. Please select class and subject with grades."
      });
      return;
    }
    
    const csvContent = convertGradesToCSV(studentGrades, selectedSubject, selectedExamType);
    const fileName = `grades_${selectedSubject}_${selectedExamType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadCSV(csvContent, fileName);
    
    toast({
      title: "Export Complete",
      description: "Grades exported successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <GradeManagementHeader title="Grade Management" />
        
        <div className="flex space-x-2">
          <GradeImportDialog onImport={handleImportGrades} />
          
          {selectedClass && studentGrades.length > 0 && (
            <ReportCardUploadDialog 
              studentId={studentGrades[0]?.id || ''} 
              studentName="Bulk Upload"
            />
          )}
          
          <Button variant="outline" size="sm" onClick={handleExportGrades}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
          onGradesSaved={refetchGrades}
        />
      )}
    </div>
  );
};

export default EnhancedTeacherGradeView;
