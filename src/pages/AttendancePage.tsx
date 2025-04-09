
import React, { useState } from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import { mockAttendance, mockClasses, mockUsers } from '../data/mockData';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');

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

  const attendance = React.useMemo(() => {
    if (!selectedDate || !selectedClass) return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return mockAttendance.filter(a => a.date === dateStr && a.classId === selectedClass);
  }, [selectedDate, selectedClass]);

  const students = React.useMemo(() => {
    if (!selectedClass) return [];
    
    const classObj = mockClasses.find(c => c.id === selectedClass);
    if (!classObj) return [];
    
    return mockUsers
      .filter(u => u.role === 'student' && classObj.students.includes(u.id))
      .map(student => {
        const attendanceRecord = attendance.length > 0 ? 
          attendance[0].records.find(r => r.studentId === student.id) : undefined;
        
        return {
          ...student,
          status: attendanceRecord ? attendanceRecord.status : 'absent'
        };
      });
  }, [selectedClass, attendance]);

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    // This would update the attendance in a real application
    console.log(`Marking ${studentId} as ${status}`);
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
                  {userClasses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.section}
                    </SelectItem>
                  ))}
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
                              className={student.status === 'present' ? 'bg-green-600' : ''}
                            >
                              <Check className="h-4 w-4 mr-1" /> Present
                            </Button>
                            <Button 
                              size="sm" 
                              variant={student.status === 'absent' ? 'default' : 'outline'}
                              onClick={() => handleMarkAttendance(student.id, 'absent')}
                              className={student.status === 'absent' ? 'bg-red-600' : ''}
                            >
                              <X className="h-4 w-4 mr-1" /> Absent
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
