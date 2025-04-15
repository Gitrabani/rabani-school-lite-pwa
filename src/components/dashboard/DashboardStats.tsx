
import React from 'react';
import { Users, BookOpen, Award } from 'lucide-react';
import StatsCard from './StatsCard';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStatsProps {
  user: User | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ user }) => {
  const [stats, setStats] = React.useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Count students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student');

        if (studentsError) throw studentsError;

        // Count teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'teacher');

        if (teachersError) throw teachersError;

        // Count classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id');

        if (classesError) throw classesError;

        // Get unique subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('class_subjects')
          .select('subject_id');

        if (subjectsError) throw subjectsError;

        // Create unique subjects set
        const uniqueSubjects = new Set(subjectsData?.map(s => s.subject_id) || []);

        let newStats: any[] = [];

        if (user.role === 'admin') {
          newStats = [
            { 
              title: 'Total Students', 
              value: studentsData?.length || 0, 
              icon: <Users size={20} />, 
              color: 'blue'
            },
            { 
              title: 'Total Classes', 
              value: classesData?.length || 0, 
              icon: <BookOpen size={20} />, 
              color: 'green'
            },
            { 
              title: 'Total Teachers', 
              value: teachersData?.length || 0, 
              icon: <Users size={20} />, 
              color: 'purple'
            },
            { 
              title: 'Total Subjects', 
              value: uniqueSubjects.size, 
              icon: <BookOpen size={20} />, 
              color: 'orange'
            },
          ];
        } else if (user.role === 'teacher') {
          // Get teacher classes
          const { data: teacherClasses, error: teacherClassesError } = await supabase
            .from('classes')
            .select('*')
            .eq('teacher_id', user.id);

          if (teacherClassesError) throw teacherClassesError;

          // Get student count in teacher's classes
          let totalStudents = 0;
          if (teacherClasses?.length) {
            const classIds = teacherClasses.map(c => c.id);
            const { data: classStudents, error: classStudentsError } = await supabase
              .from('class_students')
              .select('student_id')
              .in('class_id', classIds);

            if (classStudentsError) throw classStudentsError;

            const uniqueStudents = new Set(classStudents?.map(cs => cs.student_id) || []);
            totalStudents = uniqueStudents.size;
          }

          newStats = [
            { 
              title: 'My Classes', 
              value: teacherClasses?.length || 0, 
              icon: <BookOpen size={20} />, 
              color: 'blue'
            },
            { 
              title: 'My Students', 
              value: totalStudents, 
              icon: <Users size={20} />, 
              color: 'green'
            }
          ];
        } else if (user.role === 'student') {
          // Get student class
          const { data: studentClass, error: studentClassError } = await supabase
            .from('class_students')
            .select('class_id')
            .eq('student_id', user.id);

          if (studentClassError) throw studentClassError;

          // Get class details
          let className = 'None';
          let subjectCount = 0;
          
          if (studentClass?.length) {
            const classId = studentClass[0].class_id;
            
            const { data: classDetails, error: classDetailsError } = await supabase
              .from('classes')
              .select('name, section')
              .eq('id', classId)
              .single();

            if (classDetailsError) throw classDetailsError;

            if (classDetails) {
              className = `${classDetails.name} ${classDetails.section}`;
            }

            // Get subject count
            const { data: subjects, error: subjectsError } = await supabase
              .from('class_subjects')
              .select('subject_id')
              .eq('class_id', classId);

            if (subjectsError) throw subjectsError;
            subjectCount = subjects?.length || 0;
          }

          // Get grades
          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('id')
            .eq('student_id', user.id);

          if (gradesError) throw gradesError;

          newStats = [
            { 
              title: 'My Class', 
              value: className, 
              icon: <BookOpen size={20} />, 
              color: 'blue'
            },
            { 
              title: 'My Subjects', 
              value: subjectCount, 
              icon: <BookOpen size={20} />, 
              color: 'green'
            },
            { 
              title: 'Graded Assessments', 
              value: grades?.length || 0, 
              icon: <Award size={20} />, 
              color: 'purple'
            }
          ];
        }

        setStats(newStats);
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load dashboard statistics: ${error.message}`,
        });
      }
    };

    fetchStats();
  }, [user, toast]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatsCard 
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

