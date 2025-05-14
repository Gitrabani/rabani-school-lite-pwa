
import React from "react";
import { useAuth } from "@/context/auth/AuthProvider";
import PageHeader from "@/components/shared/PageHeader";
import TeacherGradeView from "@/components/grades/TeacherGradeView";
import StudentGradeView from "@/components/grades/StudentGradeView";
import ParentGradeView from "@/components/grades/ParentGradeView";

const GradesPage = () => {
  const { user, isLoading } = useAuth();

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
      <PageHeader 
        title="Grades" 
        description={
          user.role === "teacher" ? "Manage student grades" : 
          user.role === "parent" ? "View your child's academic progress" : 
          user.role === "admin" ? "View and monitor student grades across the school" :
          "View your academic progress"
        }
      />

      {/* Display appropriate view based on user role */}
      {user.role === "teacher" && <TeacherGradeView />}
      {(user.role === "student" || user.role === "admin") && <StudentGradeView />}
      {user.role === "parent" && <ParentGradeView />}
    </div>
  );
};

export default GradesPage;
