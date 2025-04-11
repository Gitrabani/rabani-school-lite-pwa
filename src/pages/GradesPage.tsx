import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockClasses, mockSubjects, mockUsers } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const GradesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('midterm');
  const [loading, setLoading] = useState(false);
  const [savingGrades, setSavingGrades] = useState<Record<string, boolean>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [newGradeValues, setNewGradeValues] = useState<Record<string, string>>({});
  const [newTotalMarks, setNewTotalMarks] = useState<string>('100');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let query = supabase.from('classes').select('*');
        
        if (user?.role === 'teacher') {
          query = query.eq('teacher_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classes",
          });
          return;
        }
        
        setClasses(data || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    if (user) {
      fetchClasses();
    }
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

  useEffect(() => {
    const fetchStudentsWithGrades = async () => {
      if (!selectedClass || !selectedSubject) return;
      
      setLoading(true);
      try {
        const classObj = mockClasses.find(c => c.id === selectedClass);
        if (!classObj) {
          setStudentGrades([]);
          return;
        }
        
        const studentList = mockUsers
          .filter(u => u.role === 'student' && classObj.students.includes(u.id));
        
        if (!studentList.length) {
          setStudentGrades([]);
          setLoading(false);
          return;
        }

        const { data: grades, error } = await supabase
          .from('grades')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('subject_id', selectedSubject)
          .eq('exam_type', selectedExamType);
        
        if (error) {
          console.error("Error fetching grades:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load grades",
          });
          setStudentGrades([]);
          return;
        }

        const studentsWithGrades = studentList.map(student => {
          const grade = grades?.find(g => g.student_id === student.id);
          
          if (grade?.marks) {
            setNewGradeValues(prev => ({...prev, [student.id]: grade.marks.toString()}));
          }
          
          return {
            ...student,
            grade: grade || null
          };
        });
        
        setStudentGrades(studentsWithGrades);
      } catch (error) {
        console.error("Error:", error);
        setStudentGrades([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsWithGrades();
  }, [selectedClass, selectedSubject, selectedExamType]);

  const [ownGrades, setOwnGrades] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchOwnGrades = async () => {
      if (user?.role !== 'student') return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('grades')
          .select('*, classes(*)')
          .eq('student_id', user.id);
        
        if (error) {
          console.error("Error fetching grades:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load grades",
          });
          return;
        }
        
        setOwnGrades(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'student') {
      fetchOwnGrades();
    }
  }, [user]);

  const gradesBySubject = React.useMemo(() => {
    if (user?.role !== 'student') return {};
    
    return ownGrades.reduce<Record<string, any[]>>((acc, grade) => {
      const subject = mockSubjects.find(s => s.id === grade.subject_id);
      if (subject) {
        if (!acc[subject.name]) {
          acc[subject.name] = [];
        }
        acc[subject.name].push(grade);
      }
      return acc;
    }, {});
  }, [ownGrades, user?.role]);

  const handleSaveGrade = async (studentId: string) => {
    if (!user || !selectedClass || !selectedSubject) return;
    
    const marksValue = newGradeValues[studentId];
    if (!marksValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return;
    }
    
    const marks = parseFloat(marksValue);
    const totalMarks = parseFloat(newTotalMarks);
    
    if (isNaN(marks) || marks < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid mark",
      });
      return;
    }
    
    if (isNaN(totalMarks) || totalMarks <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid total marks",
      });
      return;
    }
    
    setSavingGrades(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const { data: existingGrade } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .eq('subject_id', selectedSubject)
        .eq('class_id', selectedClass)
        .eq('exam_type', selectedExamType)
        .maybeSingle();
      
      if (existingGrade) {
        const { error } = await supabase
          .from('grades')
          .update({
            marks,
            total_marks: totalMarks,
            updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX")
          })
          .eq('id', existingGrade.id);
        
        if (error) {
          console.error("Error updating grade:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update grade",
          });
          return;
        }
      } else {
        const { error } = await supabase
          .from('grades')
          .insert({
            student_id: studentId,
            subject_id: selectedSubject,
            class_id: selectedClass,
            exam_type: selectedExamType,
            marks,
            total_marks: totalMarks,
            date: format(new Date(), 'yyyy-MM-dd'),
            created_by: user.id
          });
        
        if (error) {
          console.error("Error creating grade:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save grade",
          });
          return;
        }
      }
      
      setStudentGrades(prev => 
        prev.map(student => {
          if (student.id === studentId) {
            return {
              ...student,
              grade: {
                ...student.grade,
                marks,
                total_marks: totalMarks,
                exam_type: selectedExamType
              }
            };
          }
          return student;
        })
      );
      
      toast({
        title: "Success",
        description: "Grade has been saved",
      });
    } catch (error) {
      console.error("Error saving grade:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setSavingGrades(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleGradeInputChange = (studentId: string, value: string) => {
    setNewGradeValues(prev => ({...prev, [studentId]: value}));
  };

  return (
    <div>
      <PageHeader 
        title="Grades" 
        description={user?.role === 'teacher' ? "Manage student grades" : "View grade records"}
      />
      
      {user?.role === 'student' ? (
        <div>
          <Tabs defaultValue="bySubject">
            <TabsList className="mb-4">
              <TabsTrigger value="bySubject">By Subject</TabsTrigger>
              <TabsTrigger value="byExam">By Exam Type</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bySubject">
              {loading ? (
                <div className="space-y-6">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : Object.entries(gradesBySubject).length === 0 ? (
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
                                  {grade.exam_type.charAt(0).toUpperCase() + grade.exam_type.slice(1)}
                                </TableCell>
                                <TableCell>{grade.marks}</TableCell>
                                <TableCell>{grade.total_marks}</TableCell>
                                <TableCell>
                                  {Math.round((grade.marks / grade.total_marks) * 100)}%
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
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
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
                        {ownGrades.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              No grades available
                            </TableCell>
                          </TableRow>
                        ) : (
                          ownGrades.map(grade => {
                            const subject = mockSubjects.find(s => s.id === grade.subject_id);
                            return (
                              <TableRow key={grade.id}>
                                <TableCell className="font-medium">
                                  {subject?.name || 'Unknown Subject'}
                                </TableCell>
                                <TableCell>
                                  {grade.exam_type.charAt(0).toUpperCase() + grade.exam_type.slice(1)}
                                </TableCell>
                                <TableCell>
                                  {grade.marks} / {grade.total_marks}
                                </TableCell>
                                <TableCell>
                                  {Math.round((grade.marks / grade.total_marks) * 100)}%
                                </TableCell>
                                <TableCell>{grade.date}</TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Grade Entry</CardTitle>
              <CardDescription>
                Select class, subject, and exam type to manage grades
              </CardDescription>
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
                      {classes.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                      ) : (
                        classes.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.section}
                          </SelectItem>
                        ))
                      )}
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
                {user?.role === 'teacher' && (
                  <div className="flex items-center mt-2">
                    <label className="text-sm font-medium mr-3">Total Marks:</label>
                    <Input 
                      type="number" 
                      className="w-24" 
                      value={newTotalMarks} 
                      onChange={(e) => setNewTotalMarks(e.target.value)}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : studentGrades.length === 0 ? (
                  <div className="text-center py-8 flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No students found in this class</p>
                  </div>
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
                        {studentGrades.map(student => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              {student.grade ? (
                                <>
                                  {student.grade.marks} / {student.grade.total_marks} 
                                  ({Math.round((student.grade.marks / student.grade.total_marks) * 100)}%)
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
                                    value={newGradeValues[student.id] || ''}
                                    onChange={(e) => handleGradeInputChange(student.id, e.target.value)}
                                  />
                                  <span className="mr-2">/ {newTotalMarks}</span>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSaveGrade(student.id)}
                                    disabled={savingGrades[student.id]}
                                  >
                                    {savingGrades[student.id] ? 'Saving...' : 'Save'}
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
