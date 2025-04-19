
import { useAuth } from '../context/auth/AuthProvider';
import { useAttendanceState } from './useAttendanceState';
import { useFetchClasses, useFetchAttendance, useFetchStudents } from './useAttendanceFetchers';
import { handleMarkAttendance as markAttendance } from './useAttendanceActions';

export function useAttendance() {
  const { user } = useAuth();
  const {
    selectedDate, setSelectedDate,
    selectedClass, setSelectedClass,
    loading, setLoading,
    savingAttendance, setSavingAttendance,
    classes, setClasses,
    attendanceData, setAttendanceData,
    students, setStudents,
  } = useAttendanceState();

  useFetchClasses(user, setClasses);
  useFetchAttendance(selectedClass, selectedDate, setLoading, setAttendanceData);
  useFetchStudents(selectedClass, attendanceData, setStudents);

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') =>
    markAttendance({
      user,
      selectedClass,
      selectedDate,
      attendanceData,
      studentId,
      status,
      setAttendanceData,
      setSavingAttendance,
      setStudents,
    });

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
}
