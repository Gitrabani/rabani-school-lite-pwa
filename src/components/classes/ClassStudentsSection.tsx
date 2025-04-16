
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Class } from "@/types";
import { useClassStudents } from "@/hooks/useClassStudents";
import StudentsTable from './StudentsTable';
import AddStudentDialog from './AddStudentDialog';

interface ClassStudentsSectionProps {
  classData: Class;
}

const ClassStudentsSection: React.FC<ClassStudentsSectionProps> = ({
  classData
}) => {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const {
    students,
    availableStudents,
    isLoading,
    fetchClassStudents,
    fetchAvailableStudents,
    addStudent,
    removeStudent
  } = useClassStudents(classData.id);

  useEffect(() => {
    fetchClassStudents();
  }, [classData.id]);

  const handleOpenAddStudent = () => {
    fetchAvailableStudents();
    setShowAddStudent(true);
  };

  const handleAddStudent = async (studentId: string) => {
    const success = await addStudent(studentId);
    if (success) {
      setShowAddStudent(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Students ({students.length})</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenAddStudent}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Loading students...
            </div>
          ) : students.length > 0 ? (
            <StudentsTable 
              students={students}
              onRemoveStudent={removeStudent}
            />
          ) : (
            <div className="text-center py-4 text-gray-500">
              No students in this class
            </div>
          )}
        </CardContent>
      </Card>

      <AddStudentDialog
        open={showAddStudent}
        onOpenChange={setShowAddStudent}
        availableStudents={availableStudents}
        onAddStudent={handleAddStudent}
      />
    </>
  );
};

export default ClassStudentsSection;
