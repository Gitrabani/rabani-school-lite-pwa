
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockClasses, mockGrades, mockSubjects, mockUsers } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';

const GradesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('midterm');

  // Different views based on user role
  const userClasses = React.useMemo(() => {
    if (user?.role === 'admin') {
      return mockClasses;
    } else if (user?.role === 'teacher') {
      return mockClasses.filter(c => c.teacherId === user.id);
    } else if (user?.role === 'student') {
      return mockClasses.filter(c => c.students.includes(user.id));
    }
    return [];
  }, [user]);

  const subjects = React.useMemo(() => {
    if (!selectedClass) return [];
    
    const classObj = mockClasses.find(c => c.id === selectedClass);
    if (!classObj) return [];
    
    if (user?.role === 'teacher') {
      return mockSubjects.filter(s => s.teacherId === user.id && classObj.subjects.includes(s.id));
    }
    
    return mockSubjects.filter(s => classObj.subjects.includes(s.id));
  }, [selectedClass, user]);

  const students = React.useMemo(() => {
    if (!selectedClass) return [];
    
    const classObj = mockClasses.find(c => c.id === selectedClass);
    if (!classObj) return [];
    
    return mockUsers
      .filter(u => u.role === 'student' && classObj.students.includes(u.id))
      .map(student => {
        const grade = selectedSubject ? 
          mockGrades.find(g => 
            g.studentId === student.id && 
            g.subjectId === selectedSubject && 
            g.examType === selectedExamType
          ) : undefined;
        
        return {
          ...student,
          grade: grade || null
        };
      });
  }, [selectedClass, selectedSubject, selectedExamType]);

  const studentGrades = React.useMemo(() => {
    if (user?.role !== 'student') return [];
    
    return mockGrades.filter(g => g.studentId === user.id);
  }, [user]);

  // Group student grades by subject
  const gradesBySubject = React.useMemo(() => {
    if (user?.role !== 'student') return {};
    
    return studentGrades.reduce<Record<string, any[]>>((acc, grade) => {
      const subject = mockSubjects.find(s => s.id === grade.subjectId);
      if (subject) {
        if (!acc[subject.name]) {
          acc[subject.name] = [];
        }
        acc[subject.name].push(grade);
      }
      return acc;
    }, {});
  }, [studentGrades, user?.role]);

  // Mock function for saving grades
  const handleSaveGrade = (studentId: string, marks: number) => {
    console.log(`Saving grade for student ${studentId}: ${marks}`);
  };

  return (
    <div>
      <PageHeader 
        title="Grades" 
        description={user?.role === 'teacher' ? "Manage student grades" : "View grade records"}
      />
      
      {user?.role === 'student' ? (
        // Student view - shows their own grades
        <div>
          <Tabs defaultValue="bySubject">
            <TabsList className="mb-4">
              <TabsTrigger value="bySubject">By Subject</TabsTrigger>
              <TabsTrigger value="byExam">By Exam Type</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bySubject">
              {Object.entries(gradesBySubject).length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">No grades available</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {Object.entries(gradesBySubject).map(([subjectName, grades]) => (
                    <Card key={subjectName}>
                      <CardHeader>
                        <CardTitle>{subjectName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Exam Type</TableHead>
                              <TableHead>Marks</TableHead>
                              <TableHead>Out of</TableHead>
                              <TableHead>Percentage</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grades.map(grade => (
                              <TableRow key={grade.id}>
                                <TableCell className="font-medium">
                                  {grade.examType.charAt(0).toUpperCase() + grade.examType.slice(1)}
                                </TableCell>
                                <TableCell>{grade.marks}</TableCell>
                                <TableCell>{grade.totalMarks}</TableCell>
                                <TableCell>
                                  {Math.round((grade.marks / grade.totalMarks) * 100)}%
                                </TableCell>
                                <TableCell>{grade.date}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="byExam">
              <Card>
                <CardHeader>
                  <CardTitle>All Exam Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam Type</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentGrades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No grades available
                          </TableCell>
                        </TableRow>
                      ) : (
                        studentGrades.map(grade => {
                          const subject = mockSubjects.find(s => s.id === grade.subjectId);
                          return (
                            <TableRow key={grade.id}>
                              <TableCell className="font-medium">
                                {subject?.name || 'Unknown Subject'}
                              </TableCell>
                              <TableCell>
                                {grade.examType.charAt(0).toUpperCase() + grade.examType.slice(1)}
                              </TableCell>
                              <TableCell>
                                {grade.marks} / {grade.totalMarks}
                              </TableCell>
                              <TableCell>
                                {Math.round((grade.marks / grade.totalMarks) * 100)}%
                              </TableCell>
                              <TableCell>{grade.date}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Teacher/Admin view - can manage grades
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Grade Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {userClasses.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject} 
                    disabled={!selectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Exam Type</label>
                  <Select 
                    value={selectedExamType} 
                    onValueChange={setSelectedExamType}
                    disabled={!selectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedClass && selectedSubject && (
            <Card>
              <CardHeader>
                <CardTitle>Student Grades</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-center py-4">No students found in this class</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Current Marks</TableHead>
                          {user?.role === 'teacher' && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              {student.grade ? (
                                <>
                                  {student.grade.marks} / {student.grade.totalMarks} 
                                  ({Math.round((student.grade.marks / student.grade.totalMarks) * 100)}%)
                                </>
                              ) : (
                                'Not graded'
                              )}
                            </TableCell>
                            {user?.role === 'teacher' && (
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end">
                                  <Input 
                                    type="number" 
                                    className="w-20 mr-2" 
                                    placeholder="Marks"
                                    defaultValue={student.grade?.marks}
                                  />
                                  <span className="mr-2">/ 100</span>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSaveGrade(student.id, 85)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesPage;
