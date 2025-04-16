
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceActions } from './AttendanceActions';

interface AttendanceTableProps {
  loading: boolean;
  students: any[];
  isTeacher: boolean;
  savingAttendance: Record<string, boolean>;
  onMarkAttendance: (studentId: string, status: 'present' | 'absent' | 'late') => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  loading,
  students,
  isTeacher,
  savingAttendance,
  onMarkAttendance,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8 flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No students found in this class</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            {isTeacher && <TableHead className="text-right">Actions</TableHead>}
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
              {isTeacher && (
                <TableCell className="text-right">
                  <AttendanceActions
                    studentId={student.id}
                    currentStatus={student.status}
                    onMarkAttendance={onMarkAttendance}
                    disabled={savingAttendance[student.id]}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

