
import { useState } from 'react';

export function useAttendanceState() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState<Record<string, boolean>>({});
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  return {
    selectedDate, setSelectedDate,
    selectedClass, setSelectedClass,
    loading, setLoading,
    savingAttendance, setSavingAttendance,
    classes, setClasses,
    attendanceData, setAttendanceData,
    students, setStudents,
  }
}
