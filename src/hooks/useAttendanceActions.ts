
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function handleMarkAttendance({
  user, selectedClass, selectedDate, attendanceData, studentId, status, setAttendanceData, setSavingAttendance, setStudents
}) {
  if (!user || !selectedClass || !selectedDate) return;
  setSavingAttendance(prev => ({ ...prev, [studentId]: true }));
  try {
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
        setSavingAttendance(prev => ({ ...prev, [studentId]: false }));
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
        setSavingAttendance(prev => ({ ...prev, [studentId]: false }));
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
        setSavingAttendance(prev => ({ ...prev, [studentId]: false }));
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
      const updatedRecords = prev.attendance_records?.map((record) => {
        if (record.student_id === studentId) {
          return { ...record, status };
        }
        return record;
      }) || [];
      const exists = updatedRecords.some((record) => record.student_id === studentId);
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
}
