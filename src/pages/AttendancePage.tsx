
import React from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import PageHeader from '../components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceFilters } from '@/components/attendance/AttendanceFilters';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { useAttendance } from '@/hooks/useAttendance';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { 
    selectedDate, 
    setSelectedDate,
    selectedClass, 
    setSelectedClass,
    loading,
    savingAttendance,
    classes,
    students,
    handleMarkAttendance
  } = useAttendance();

  return (
    <div>
      <PageHeader 
        title="Attendance" 
        description={user?.role === 'teacher' ? "Mark and view student attendance" : "View attendance records"}
      />
      
      <AttendanceFilters
        selectedDate={selectedDate}
        selectedClass={selectedClass}
        classes={classes}
        onDateChange={setSelectedDate}
        onClassChange={setSelectedClass}
      />
      
      {selectedClass && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === 'teacher' ? 'Mark Attendance' : 'Attendance Records'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTable
              loading={loading}
              students={students}
              isTeacher={user?.role === 'teacher'}
              savingAttendance={savingAttendance}
              onMarkAttendance={handleMarkAttendance}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;
