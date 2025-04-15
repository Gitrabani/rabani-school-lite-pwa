
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '../components/shared/PageHeader';
import StatsCard from '../components/dashboard/StatsCard';
import AnnouncementsList from '../components/dashboard/AnnouncementsList';
import { Users, BookOpen, Award, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: {
    roles?: string[];
    classes?: string[];
    specific?: string[];
  };
  created_at: string;
  author_id?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log('Fetching announcements...');
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching announcements:', error);
          return;
        }

        console.log('Announcements fetched:', data);
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };

    const fetchStats = async () => {
      if (!user) return;

      try {
        console.log('Fetching statistics...');
        setLoading(true);

        // Count students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student');

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
        }

        // Count teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'teacher');

        if (teachersError) {
          console.error('Error fetching teachers:', teachersError);
        }

        // Count classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id');

        if (classesError) {
          console.error('Error fetching classes:', classesError);
        }

        // Get unique subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('class_subjects')
          .select('subject_id');

        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
        }

        // Create unique subjects set
        const uniqueSubjects = new Set(subjectsData?.map(s => s.subject_id) || []);
        
        console.log('Stats fetched successfully');
        
        // Create stats based on user role
        const newStats = [];
        
        if (user.role === 'admin') {
          newStats.push(
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
          );
        } else if (user.role === 'teacher') {
          // Get teacher classes
          const { data: teacherClasses, error: teacherClassesError } = await supabase
            .from('classes')
            .select('*')
            .eq('teacher_id', user.id);

          if (teacherClassesError) {
            console.error('Error fetching teacher classes:', teacherClassesError);
          }

          // Get student count in teacher's classes
          let totalStudents = 0;
          if (teacherClasses?.length) {
            const classIds = teacherClasses.map(c => c.id);
            const { data: classStudents, error: classStudentsError } = await supabase
              .from('class_students')
              .select('student_id')
              .in('class_id', classIds);

            if (classStudentsError) {
              console.error('Error fetching class students:', classStudentsError);
            } else {
              // Count unique students
              const uniqueStudents = new Set(classStudents?.map(cs => cs.student_id) || []);
              totalStudents = uniqueStudents.size;
            }
          }

          newStats.push(
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
          );
        } else if (user.role === 'student') {
          // Get student class
          const { data: studentClass, error: studentClassError } = await supabase
            .from('class_students')
            .select('class_id')
            .eq('student_id', user.id);

          if (studentClassError) {
            console.error('Error fetching student class:', studentClassError);
          }

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

            if (classDetailsError) {
              console.error('Error fetching class details:', classDetailsError);
            } else if (classDetails) {
              className = `${classDetails.name} ${classDetails.section}`;
            }

            // Get subject count
            const { data: subjects, error: subjectsError } = await supabase
              .from('class_subjects')
              .select('subject_id')
              .eq('class_id', classId);

            if (subjectsError) {
              console.error('Error fetching subjects:', subjectsError);
            } else {
              subjectCount = subjects?.length || 0;
            }
          }

          // Get grades
          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('id')
            .eq('student_id', user.id);

          if (gradesError) {
            console.error('Error fetching grades:', gradesError);
          }

          newStats.push(
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
          );
        }

        setStats(newStats);

      } catch (error: any) {
        console.error('Error fetching stats:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load dashboard data: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
    fetchStats();
  }, [user, toast]);

  // Filter announcements based on user role
  const filteredAnnouncements = announcements.filter(announcement => {
    if (!user) return false;
    
    // Check if announcement is for this user's role
    if (announcement.audience?.roles && announcement.audience.roles.includes(user.role)) {
      return true;
    }
    
    // Check if announcement is for specific users
    if (announcement.audience?.specific && announcement.audience.specific.includes(user.id)) {
      return true;
    }
    
    return false;
  });

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user?.name || 'User'}`} 
        description={`${user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} Dashboard`} 
      />
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading announcements...</p>
              ) : filteredAnnouncements.length > 0 ? (
                <AnnouncementsList announcements={filteredAnnouncements} />
              ) : (
                <p className="text-muted-foreground">No announcements available.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {user?.role === 'teacher' && (
                  <>
                    <a href="/attendance" className="block p-2 hover:bg-gray-50 rounded-md">Mark Attendance</a>
                    <a href="/grades" className="block p-2 hover:bg-gray-50 rounded-md">Enter Grades</a>
                  </>
                )}
                {user?.role === 'student' && (
                  <>
                    <a href="/attendance" className="block p-2 hover:bg-gray-50 rounded-md">View My Attendance</a>
                    <a href="/grades" className="block p-2 hover:bg-gray-50 rounded-md">View My Grades</a>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <a href="/users" className="block p-2 hover:bg-gray-50 rounded-md">Manage Users</a>
                    <a href="/classes" className="block p-2 hover:bg-gray-50 rounded-md">Manage Classes</a>
                    <a href="/announcements" className="block p-2 hover:bg-gray-50 rounded-md">Create Announcement</a>
                  </>
                )}
                <a href="/announcements" className="block p-2 hover:bg-gray-50 rounded-md">All Announcements</a>
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
