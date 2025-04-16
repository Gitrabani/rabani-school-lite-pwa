
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceActionsProps {
  studentId: string;
  currentStatus: string;
  onMarkAttendance: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  disabled: boolean;
}

export const AttendanceActions: React.FC<AttendanceActionsProps> = ({
  studentId,
  currentStatus,
  onMarkAttendance,
  disabled
}) => {
  return (
    <div className="space-x-1">
      <Button 
        size="sm" 
        variant={currentStatus === 'present' ? 'default' : 'outline'}
        onClick={() => onMarkAttendance(studentId, 'present')}
        className={cn(currentStatus === 'present' ? 'bg-green-600' : '')}
        disabled={disabled}
      >
        <Check className="h-4 w-4 mr-1" /> Present
      </Button>
      <Button 
        size="sm" 
        variant={currentStatus === 'absent' ? 'default' : 'outline'}
        onClick={() => onMarkAttendance(studentId, 'absent')}
        className={cn(currentStatus === 'absent' ? 'bg-red-600' : '')}
        disabled={disabled}
      >
        <X className="h-4 w-4 mr-1" /> Absent
      </Button>
      <Button
        size="sm"
        variant={currentStatus === 'late' ? 'default' : 'outline'}
        onClick={() => onMarkAttendance(studentId, 'late')}
        className={cn(currentStatus === 'late' ? 'bg-yellow-600' : '')}
        disabled={disabled}
      >
        Late
      </Button>
    </div>
  );
};

