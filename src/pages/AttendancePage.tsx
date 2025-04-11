
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import { mockClasses, mockUsers } from '../data/mockData';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState<Record<string, boolean>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let query = supabase.from('classes').select('*');
        
        // Filter classes based on user role
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

  // Fetch attendance data when class and date change
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass || !selectedDate) return;
      
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Check if attendance record exists for this date and class
        const { data, error } = await supabase
          .from('attendance')
          .select('*, attendance_records(*)')
          .eq('class_id', selectedClass)
          .eq('date', dateStr)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error("Error fetching attendance:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load attendance records",
          });
          setAttendanceData(null);
        } else {
          setAttendanceData(data || null);
        }
      } catch (error) {
        console.error("Error:", error);
        setAttendanceData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [selectedClass, selectedDate]);

  // Fetch students for the selected class
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      // For now, using mock data since we don't have a full implementation
      // of the student-class relationship in our database yet
      const classObj = mockClasses.find(c => c.id === selectedClass);
      if (!classObj) {
        setStudents([]);
        return;
      }
      
      const studentList = mockUsers
        .filter(u => u.role === 'student' && classObj.students.includes(u.id))
        .map(student => {
          // Check if there's attendance data for this student
          const attendanceRecord = attendanceData?.attendance_records?.find(
            (r: any) => r.student_id === student.id
          );
          
          return {
            ...student,
            status: attendanceRecord ? attendanceRecord.status : 'absent'
          };
        });
      
      setStudents(studentList);
    };
    
    fetchStudents();
  }, [selectedClass, attendanceData]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!user || !selectedClass || !selectedDate) return;
    
    setSavingAttendance(prev => ({ ...prev, [studentId]: true }));
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Create an attendance record if it doesn't exist
      let attendanceId = attendanceData?.id;
      
      if (!attendanceId) {
        const { data: newAttendance, error: attendanceError } = await supabase
          .from('attendance')
          .insert({
            date: dateStr,
            class_id: selectedClass,
            created_by: user.id
          })
          .select()
          .single();
        
        if (attendanceError) {
          console.error("Error creating attendance record:", attendanceError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create attendance record",
          });
          return;
        }
        
        attendanceId = newAttendance.id;
      }
      
      // Check if a record already exists for this student
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('attendance_id', attendanceId)
        .eq('student_id', studentId)
        .single();
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('attendance_records')
          .update({ status })
          .eq('id', existingRecord.id);
        
        if (updateError) {
          console.error("Error updating attendance record:", updateError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update attendance status",
          });
          return;
        }
      } else {
        // Create new attendance record
        const { error: insertError } = await supabase
          .from('attendance_records')
          .insert({
            attendance_id: attendanceId,
            student_id: studentId,
            status
          });
        
        if (insertError) {
          console.error("Error creating attendance record:", insertError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save attendance status",
          });
          return;
        }
      }
      
      // Update local state
      setAttendanceData(prev => {
        if (!prev) {
          return {
            id: attendanceId,
            date: dateStr,
            class_id: selectedClass,
            attendance_records: [
              { student_id: studentId, status }
            ]
          };
        }
        
        const updatedRecords = prev.attendance_records?.map((record: any) => {
          if (record.student_id === studentId) {
            return { ...record, status };
          }
          return record;
        }) || [];
        
        // Add record if it doesn't exist
        const exists = updatedRecords.some((record: any) => record.student_id === studentId);
        if (!exists) {
          updatedRecords.push({ student_id: studentId, status });
        }
        
        return {
          ...prev,
          attendance_records: updatedRecords
        };
      });
      
      // Show success toast
      toast({
        title: "Success",
        description: `Attendance marked as ${status} for the student`,
      });
      
      // Update student status in the UI
      setStudents(prev => 
        prev.map(student => 
          student.id === studentId ? { ...student, status } : student
        )
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setSavingAttendance(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div>
      <PageHeader 
        title="Attendance" 
        description={user?.role === 'teacher' ? "Mark and view student attendance" : "View attendance records"}
      />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Attendance Filter</CardTitle>
          <CardDescription>Select a date and class to view or mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
          </div>
        </CardContent>
      </Card>
      
      {selectedClass && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === 'teacher' ? 'Mark Attendance' : 'Attendance Records'}
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : students.length === 0 ? (
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
                      <TableHead>Status</TableHead>
                      {user?.role === 'teacher' && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              student.status === 'present' && 'bg-green-100 text-green-800',
                              student.status === 'absent' && 'bg-red-100 text-red-800',
                              student.status === 'late' && 'bg-yellow-100 text-yellow-800',
                            )}
                          >
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {user?.role === 'teacher' && (
                          <TableCell className="text-right space-x-1">
                            <Button 
                              size="sm" 
                              variant={student.status === 'present' ? 'default' : 'outline'}
                              onClick={() => handleMarkAttendance(student.id, 'present')}
                              className={cn(student.status === 'present' ? 'bg-green-600' : '')}
                              disabled={savingAttendance[student.id]}
                            >
                              <Check className="h-4 w-4 mr-1" /> Present
                            </Button>
                            <Button 
                              size="sm" 
                              variant={student.status === 'absent' ? 'default' : 'outline'}
                              onClick={() => handleMarkAttendance(student.id, 'absent')}
                              className={cn(student.status === 'absent' ? 'bg-red-600' : '')}
                              disabled={savingAttendance[student.id]}
                            >
                              <X className="h-4 w-4 mr-1" /> Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === 'late' ? 'default' : 'outline'}
                              onClick={() => handleMarkAttendance(student.id, 'late')}
                              className={cn(student.status === 'late' ? 'bg-yellow-600' : '')}
                              disabled={savingAttendance[student.id]}
                            >
                              Late
                            </Button>
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
  );
};

export default AttendancePage;
