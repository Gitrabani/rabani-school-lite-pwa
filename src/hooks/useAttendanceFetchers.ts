
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
          console.log(`[useFetchClasses] Teacher-specific fetch for teacher_id: ${user.id}`);
        } else {
          console.log('[useFetchClasses] Fetching all classes (not limited to teacher)');
        }
        const { data, error } = await query;
        if (error) {
          console.error("[useFetchClasses] Error fetching classes:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classes",
          });
          return;
        }
        console.log("[useFetchClasses] Classes data fetched:", data);
        setClasses(data || []);
      } catch (error) {
        console.error("[useFetchClasses] Unexpected error:", error);
      }
    };
    if (user) {
      console.log("[useFetchClasses] User info:", user);
      fetchClasses();
    }
  }, [user, setClasses]);
}

export function useFetchAttendance(selectedClass, selectedDate, setLoading, setAttendanceData) {
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass || !selectedDate) {
        console.warn('[useFetchAttendance] selectedClass or selectedDate missing, skipping fetch.', { selectedClass, selectedDate });
        return;
      }
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log("[useFetchAttendance] Fetching attendance for:", { selectedClass, dateStr });
        const { data, error } = await supabase
          .from('attendance')
          .select('*, attendance_records(*)')
          .eq('class_id', selectedClass)
          .eq('date', dateStr)
          .maybeSingle(); // Use maybeSingle to avoid single() errors for missing data
        if (error && error.code !== 'PGRST116') {
          console.error("[useFetchAttendance] Error fetching attendance:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load attendance records",
          });
          setAttendanceData(null);
        } else {
          console.log("[useFetchAttendance] Attendance data fetched:", data);
          setAttendanceData(data || null);
        }
      } catch (error) {
        console.error("[useFetchAttendance] Unexpected error:", error);
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
        console.warn('[useFetchStudents] No selectedClass, setting students to empty array.');
        setStudents([]);
        return;
      }
      try {
        console.log("[useFetchStudents] Fetching class_students for class_id:", selectedClass);
        const { data: classStudentsData, error: classStudentsError } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', selectedClass);

        if (classStudentsError) {
          console.error("[useFetchStudents] Error fetching class students:", classStudentsError);
          return;
        }
        console.log("[useFetchStudents] classStudentsData:", classStudentsData);

        if (!classStudentsData.length) {
          setStudents([]);
          return;
        }

        const studentIds = classStudentsData.map(cs => cs.student_id);
        console.log("[useFetchStudents] Fetching student profiles for IDs:", studentIds);

        const { data: studentProfiles, error: studentProfilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds);

        if (studentProfilesError) {
          console.error("[useFetchStudents] Error fetching student profiles:", studentProfilesError);
          return;
        }
        console.log("[useFetchStudents] studentProfiles:", studentProfiles);

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
        console.log("[useFetchStudents] Mapped student list (with attendance):", studentList);
        setStudents(studentList);
      } catch (error) {
        console.error("[useFetchStudents] Unexpected error:", error);
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedClass, attendanceData, setStudents]);
}

