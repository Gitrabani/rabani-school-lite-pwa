
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAttendanceData = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const { data: attendance } = await supabase
          .from('attendance_records')
          .select(`
            status,
            attendance (
              date
            )
          `);

        const monthlyAttendance = new Array(12).fill(null).map((_, idx) => {
          const month = new Date(2025, idx).toLocaleString('default', { month: 'short' });
          const records = attendance?.filter(record => {
            const recordMonth = new Date(record.attendance.date).getMonth();
            return recordMonth === idx;
          }) || [];

          const present = records.filter(r => r.status === 'present').length;
          const absent = records.filter(r => r.status === 'absent').length;
          const late = records.filter(r => r.status === 'late').length;
          const total = Math.max(present + absent + late, 1);

          return {
            month,
            present: (present / total) * 100,
            absent: (absent / total) * 100,
            late: (late / total) * 100
          };
        });

        setAttendanceData(monthlyAttendance);
      } catch (error: any) {
        console.error('Error fetching attendance data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load attendance data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [toast]);

  return { attendanceData, loading };
};
