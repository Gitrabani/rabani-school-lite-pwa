
import React from "react";
import { useAuth } from "@/context/auth/AuthProvider";
import PageHeader from "@/components/shared/PageHeader";
import TeacherGradeView from "@/components/grades/TeacherGradeView";
import StudentGradeView from "@/components/grades/StudentGradeView";
import ParentGradeView from "@/components/grades/ParentGradeView";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertGradesToCSV, downloadCSV } from "@/utils/gradesCsvUtils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const GradesPage = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Function for admin to export all grades
  const exportAllGrades = async () => {
    if (!user || user.role !== "admin") return;

    try {
      toast({
        title: "Exporting",
        description: "Preparing grades export..."
      });

      const { data: grades, error } = await supabase
        .from("grades")
        .select("*, profiles!grades_student_id_fkey(full_name)");

      if (error) {
        throw error;
      }

      if (!grades || grades.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data",
          description: "No grade data available to export"
        });
        return;
      }

      // Format data for CSV
      let csvContent = "Student ID,Student Name,Subject ID,Class ID,Exam Type,Marks,Total Marks,Date\n";
      
      grades.forEach(grade => {
        const studentName = grade.profiles ? grade.profiles.full_name : "Unknown";
        csvContent += `${grade.student_id},"${studentName}",${grade.subject_id},${grade.class_id},${grade.exam_type},${grade.marks},${grade.total_marks},${grade.date}\n`;
      });

      const fileName = `all_grades_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvContent, fileName);

      toast({
        title: "Export Complete",
        description: `${grades.length} grade records exported successfully`
      });
    } catch (error: any) {
      console.error("Error exporting grades:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "An error occurred during export"
      });
    }
  };

  // Display appropriate loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader title="Grades" description="Loading..." />
        <div className="animate-pulse bg-muted h-96 rounded-md"></div>
      </div>
    );
  }

  // Make sure we have a user before trying to access user.role
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader title="Grades" description="Please log in to view grades." />
        <div className="bg-muted p-6 rounded-md text-center">
          You need to log in to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <PageHeader 
          title="Grades" 
          description={
            user.role === "teacher" ? "Manage student grades" : 
            user.role === "parent" ? "View your child's academic progress" : 
            user.role === "admin" ? "View and monitor student grades across the school" :
            "View your academic progress"
          }
        />

        {/* Admin Export Button */}
        {user.role === "admin" && (
          <Button 
            variant="outline" 
            onClick={exportAllGrades}
            className="mt-4 md:mt-0"
          >
            <Download className="mr-2 h-4 w-4" />
            Export All Grades
          </Button>
        )}
      </div>

      {/* Display appropriate view based on user role */}
      {user.role === "teacher" && <TeacherGradeView />}
      {(user.role === "student" || user.role === "admin") && <StudentGradeView />}
      {user.role === "parent" && <ParentGradeView />}
    </div>
  );
};

export default GradesPage;
