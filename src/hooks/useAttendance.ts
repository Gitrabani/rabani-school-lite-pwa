
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

export const useAttendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState<Record<string, boolean>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass || !selectedDate) return;
      
      setLoading(true);
      try {
        // Format date as ISO string and then take just the date part (yyyy-MM-dd)
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log("Fetching attendance with date:", dateStr);
        
        const { data, error } = await supabase
          .from('attendance')
          .select('*, attendance_records(*)')
          .eq('class_id', selectedClass)
          .eq('date', dateStr)
          .single();
        
        if (error && error.code !== 'PGRST116') {
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

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      try {
        // Get students for the selected class
        const { data: classStudentsData, error: classStudentsError } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', selectedClass);
        
        if (classStudentsError) {
          console.error("Error fetching class students:", classStudentsError);
          return;
        }
        
        if (!classStudentsData.length) {
          setStudents([]);
          return;
        }
        
        // Get student profiles
        const { data: studentProfiles, error: studentProfilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', classStudentsData.map(cs => cs.student_id));
          
        if (studentProfilesError) {
          console.error("Error fetching student profiles:", studentProfilesError);
          return;
        }
        
        // Map students with their attendance status
        const studentList = studentProfiles.map(student => {
          const attendanceRecord = attendanceData?.attendance_records?.find(
            (r: any) => r.student_id === student.id
          );
          
          return {
            id: student.id,
            name: student.full_name || 'Unknown Student',
            status: attendanceRecord ? attendanceRecord.status : 'absent'
          };
        });
        
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    };
    
    fetchStudents();
  }, [selectedClass, attendanceData]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!user || !selectedClass || !selectedDate) return;
    
    setSavingAttendance(prev => ({ ...prev, [studentId]: true }));
    
    try {
      // Format date as ISO string and then take just the date part (yyyy-MM-dd)
      const dateStr = selectedDate.toISOString().split('T')[0];
      
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
      
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('attendance_id', attendanceId)
        .eq('student_id', studentId)
        .single();
      
      if (existingRecord) {
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
        
        const exists = updatedRecords.some((record: any) => record.student_id === studentId);
        if (!exists) {
          updatedRecords.push({ student_id: studentId, status });
        }
        
        return {
          ...prev,
          attendance_records: updatedRecords
        };
      });
      
      toast({
        title: "Success",
        description: `Attendance marked as ${status} for the student`,
      });
      
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

  return {
    selectedDate,
    setSelectedDate,
    selectedClass,
    setSelectedClass,
    loading,
    savingAttendance,
    classes,
    students,
    handleMarkAttendance
  };
};
