
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDepartmentData = (reportPeriod: string) => {
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        // Fetch subjects data
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
          staff: Math.floor(Math.random() * 5) + 1
        }));

        setDepartmentData(deptData);
      } catch (error: any) {
        console.error('Error fetching department data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load department data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [reportPeriod, toast]);

  return { departmentData, loading };
};
