
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReportData = (reportPeriod: string = 'current-year') => {
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Fetch department data
        const { data: subjects } = await supabase
          .from('class_subjects')
          .select('subject_id');

        const { data: classStudents } = await supabase
          .from('class_students')
          .select('student_id');

        const { data: teachers } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'teacher');

        // Process subjects into departments
        const departments = new Map();
        subjects?.forEach(({ subject_id }) => {
          const dept = subject_id.split(' ')[0];
          if (!departments.has(dept)) {
            departments.set(dept, {
              name: dept,
              students: new Set(),
              teachers: new Set(),
              staff: 0
            });
          }
        });

        // Add students to departments
        classStudents?.forEach(({ student_id }) => {
          departments.forEach(dept => {
            dept.students.add(student_id);
          });
        });

        // Add teachers to departments
        teachers?.forEach(teacher => {
          departments.forEach(dept => {
            dept.teachers.add(teacher.id);
          });
        });

        const deptData = Array.from(departments.values()).map(dept => ({
          name: dept.name,
          students: dept.students.size,
          teachers: dept.teachers.size,
          staff: Math.floor(Math.random() * 5) + 1 // This would need real data from a staff table
        }));

        setDepartmentData(deptData);

        // Fetch attendance data
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

        // Fetch grades data
        const { data: grades } = await supabase
          .from('grades')
          .select('*');

        if (grades) {
          // Calculate grade distribution
          const gradeRanges = [
            { grade: 'A+', min: 95 },
            { grade: 'A', min: 90 },
            { grade: 'B+', min: 85 },
            { grade: 'B', min: 80 },
            { grade: 'C+', min: 75 },
            { grade: 'C', min: 70 },
            { grade: 'D', min: 60 },
            { grade: 'F', min: 0 }
          ];

          const distribution = gradeRanges.map(range => {
            const count = grades.filter(grade => {
              const percentage = (grade.marks / grade.total_marks) * 100;
              return percentage >= range.min && 
                (range.grade === 'A+' ? percentage <= 100 : 
                 percentage < gradeRanges[gradeRanges.indexOf(range) - 1]?.min || 100);
            }).length;
            return {
              grade: range.grade,
              count,
              percentage: (count / grades.length) * 100
            };
          });

          setGradeDistribution(distribution);

          // Calculate subject performance
          const subjectStats = new Map();
          grades.forEach(grade => {
            if (!subjectStats.has(grade.subject_id)) {
              subjectStats.set(grade.subject_id, {
                subject: grade.subject_id,
                totalMarks: 0,
                totalPossible: 0,
                count: 0,
                passed: 0
              });
            }
            const stats = subjectStats.get(grade.subject_id);
            stats.totalMarks += grade.marks;
            stats.totalPossible += grade.total_marks;
            stats.count += 1;
            if ((grade.marks / grade.total_marks) >= 0.6) {
              stats.passed += 1;
            }
          });

          const subjectPerf = Array.from(subjectStats.values()).map(stats => ({
            subject: stats.subject,
            avgGrade: Math.round((stats.totalMarks / stats.totalPossible) * 100),
            passRate: Math.round((stats.passed / stats.count) * 100)
          }));

          setSubjectPerformance(subjectPerf);
        }

      } catch (error: any) {
        console.error('Error fetching report data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load report data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [reportPeriod, toast]);

  return {
    loading,
    departmentData,
    attendanceData,
    gradeDistribution,
    subjectPerformance
  };
};
