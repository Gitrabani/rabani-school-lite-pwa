
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, X, Plus } from "lucide-react";
import { Class, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassStudentsSectionProps {
  classData: Class;
}

const ClassStudentsSection: React.FC<ClassStudentsSectionProps> = ({
  classData
}) => {
  const [students, setStudents] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch students for this class
  useEffect(() => {
    const fetchClassStudents = async () => {
      setIsLoading(true);
      try {
        // Get all students from this class
        const { data: classStudentsData, error: classStudentsError } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', classData.id);

        if (classStudentsError) {
          console.error("Error fetching class students:", classStudentsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load students for this class.",
          });
          return;
        }

        const studentIds = classStudentsData.map(cs => cs.student_id);
        
        if (studentIds.length > 0) {
          // Get student details
          const { data: studentsData, error: studentsError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', studentIds)
            .eq('role', 'student');
            
          if (studentsError) {
            console.error("Error fetching student profiles:", studentsError);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load student details.",
            });
            return;
          }

          const formattedStudents = studentsData.map(student => ({
            id: student.id,
            name: student.full_name || 'Unknown',
            email: '', // Email is not available in profiles
            role: 'student' as const,
            profileImage: student.avatar_url || undefined
          }));

          setStudents(formattedStudents);
        } else {
          setStudents([]);
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `An unexpected error occurred: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassStudents();
  }, [classData.id, toast]);

  // Fetch available students (not in this class)
  const fetchAvailableStudents = async () => {
    try {
      // Get all students from this class
      const { data: classStudentsData, error: classStudentsError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classData.id);

      if (classStudentsError) {
        console.error("Error fetching class students:", classStudentsError);
        return;
      }

      const studentIds = classStudentsData.map(cs => cs.student_id);
      
      // Get all students not in this class
      const { data: availableStudentsData, error: availableStudentsError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'student');
        
      if (availableStudentsError) {
        console.error("Error fetching available students:", availableStudentsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load available students.",
        });
        return;
      }

      // Filter out students already in this class
      const filteredStudents = availableStudentsData.filter(student => 
        !studentIds.includes(student.id)
      );

      const formattedStudents = filteredStudents.map(student => ({
        id: student.id,
        name: student.full_name || 'Unknown',
        email: '', // Email is not available in profiles
        role: 'student' as const,
        profileImage: student.avatar_url || undefined
      }));

      setAvailableStudents(formattedStudents);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  // Open add student dialog and fetch available students
  const handleOpenAddStudent = () => {
    fetchAvailableStudents();
    setShowAddStudent(true);
  };

  // Add student to class
  const handleAddStudent = async (studentId: string) => {
    try {
      // Add student to class
      const { error } = await supabase
        .from('class_students')
        .insert({ class_id: classData.id, student_id: studentId });

      if (error) {
        console.error("Error adding student to class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add student to class.",
        });
        return;
      }

      // Refresh student lists
      await fetchAvailableStudents();
      
      // Find student in available students and add to class students
      const student = availableStudents.find(s => s.id === studentId);
      if (student) {
        setStudents(prev => [...prev, student]);
      }

      toast({
        title: "Success",
        description: "Student added to class successfully.",
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  // Remove student from class
  const handleRemoveStudent = async (studentId: string) => {
    try {
      // Remove student from class
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classData.id)
        .eq('student_id', studentId);

      if (error) {
        console.error("Error removing student from class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove student from class.",
        });
        return;
      }

      // Remove student from state
      setStudents(prev => prev.filter(s => s.id !== studentId));

      toast({
        title: "Success",
        description: "Student removed from class successfully.",
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
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

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Select a student to add to the class
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
    </>
  );
};

export default ClassStudentsSection;
