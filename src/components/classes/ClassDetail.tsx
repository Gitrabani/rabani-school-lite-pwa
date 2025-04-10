
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockUsers, mockSubjects } from "@/data/mockData";
import { Class } from "@/types";
import ClassStudentsSection from './ClassStudentsSection';
import ClassSubjectsSection from './ClassSubjectsSection';

interface ClassDetailProps {
  classData: Class;
  onUpdate: (updatedClass: Class) => void;
  onClose: () => void;
  open: boolean;
}

const ClassDetail: React.FC<ClassDetailProps> = ({
  classData,
  onUpdate,
  onClose,
  open,
}) => {
  const { toast } = useToast();
  
  const teacherName = mockUsers.find(u => u.id === classData.teacherId)?.name || 'Unassigned';
  const students = mockUsers.filter(u => u.role === 'student' && classData.students.includes(u.id));
  const subjects = mockSubjects.filter(s => classData.subjects.includes(s.id));
  
  // Available students/subjects (not yet in the class)
  const availableStudents = mockUsers.filter(
    u => u.role === 'student' && !classData.students.includes(u.id)
  );
  
  const availableSubjects = mockSubjects.filter(
    s => !classData.subjects.includes(s.id)
  );

  const handleAddStudent = (studentId: string) => {
    if (!classData.students.includes(studentId)) {
      const updatedClass = {
        ...classData,
        students: [...classData.students, studentId]
      };
      onUpdate(updatedClass);
      toast({
        title: "Student Added",
        description: "The student has been added to the class."
      });
    }
  };
  
  const handleRemoveStudent = (studentId: string) => {
    const updatedClass = {
      ...classData,
      students: classData.students.filter(id => id !== studentId)
    };
    onUpdate(updatedClass);
    toast({
      title: "Student Removed",
      description: "The student has been removed from the class."
    });
  };
  
  const handleAddSubject = (subjectId: string) => {
    if (!classData.subjects.includes(subjectId)) {
      const updatedClass = {
        ...classData,
        subjects: [...classData.subjects, subjectId]
      };
      onUpdate(updatedClass);
      toast({
        title: "Subject Added",
        description: "The subject has been added to the class."
      });
    }
  };
  
  const handleRemoveSubject = (subjectId: string) => {
    const updatedClass = {
      ...classData,
      subjects: classData.subjects.filter(id => id !== subjectId)
    };
    onUpdate(updatedClass);
    toast({
      title: "Subject Removed",
      description: "The subject has been removed from the class."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{classData.name} {classData.section}</DialogTitle>
          <DialogDescription>
            Class Teacher: {teacherName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Students Section */}
          <ClassStudentsSection
            students={students}
            availableStudents={availableStudents}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
          />
          
          {/* Subjects Section */}
          <ClassSubjectsSection
            subjects={subjects}
            availableSubjects={availableSubjects}
            onAddSubject={handleAddSubject}
            onRemoveSubject={handleRemoveSubject}
          />
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetail;
