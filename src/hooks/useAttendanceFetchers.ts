
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useFetchClasses(user, setClasses) {
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
    if (user) fetchClasses();
  }, [user, setClasses]);
}

export function useFetchAttendance(selectedClass, selectedDate, setLoading, setAttendanceData) {
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass || !selectedDate) return;
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log("Fetching attendance with date:", dateStr);
        const { data, error } = await supabase
          .from('attendance')
          .select('*, attendance_records(*)')
          .eq('class_id', selectedClass)
          .eq('date', dateStr)
          .maybeSingle(); // <-- changed from single() to maybeSingle()
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
  }, [selectedClass, selectedDate, setLoading, setAttendanceData]);
}

export function useFetchStudents(selectedClass, attendanceData, setStudents) {
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      try {
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

        const { data: studentProfiles, error: studentProfilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', classStudentsData.map(cs => cs.student_id));

        if (studentProfilesError) {
          console.error("Error fetching student profiles:", studentProfilesError);
          return;
        }

        const studentList = studentProfiles.map(student => {
          const attendanceRecord = attendanceData?.attendance_records?.find(
            (r) => r.student_id === student.id
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
  }, [selectedClass, attendanceData, setStudents]);
}
