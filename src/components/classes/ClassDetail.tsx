
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, UserPlus, BookPlus } from "lucide-react";
import { mockUsers, mockSubjects } from "@/data/mockData";
import { Class, User, Subject } from "@/types";

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
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  
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
      setShowAddStudent(false);
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
      setShowAddSubject(false);
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
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Students ({students.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddStudent(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No students in this class
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Subjects Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Subjects ({subjects.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddSubject(true)}
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subject => (
                    <Badge 
                      key={subject.id} 
                      variant="secondary" 
                      className="px-3 py-1 flex items-center gap-2"
                    >
                      {subject.name}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1" 
                        onClick={() => handleRemoveSubject(subject.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No subjects in this class
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Select a student to add to {classData.name} {classData.section}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {availableStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddStudent(student.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No available students to add
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStudent(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
            <DialogDescription>
              Select a subject to add to {classData.name} {classData.section}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {availableSubjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableSubjects.map(subject => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddSubject(subject.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No available subjects to add
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubject(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default ClassDetail;
