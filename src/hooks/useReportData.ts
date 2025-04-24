
import { useDepartmentData } from './reports/useDepartmentData';
import { useAttendanceData } from './reports/useAttendanceData';
import { useGradesData } from './reports/useGradesData';

export const useReportData = (reportPeriod: string = 'current-year') => {
  const { departmentData, loading: deptLoading } = useDepartmentData(reportPeriod);
  const { attendanceData, loading: attendanceLoading } = useAttendanceData();
  const { gradeDistribution, subjectPerformance, loading: gradesLoading } = useGradesData();

  const loading = deptLoading || attendanceLoading || gradesLoading;

  return {
    departmentData,
    attendanceData,
    gradeDistribution,
    subjectPerformance,
    loading
  };
};
