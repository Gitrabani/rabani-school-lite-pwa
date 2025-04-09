
import React from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import { mockAnnouncements, mockClasses, mockGrades, mockSubjects, mockUsers } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import StatsCard from '../components/dashboard/StatsCard';
import AnnouncementsList from '../components/dashboard/AnnouncementsList';
import { Users, BookOpen, Award, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Filter announcements based on user role
  const filteredAnnouncements = mockAnnouncements.filter(announcement => {
    if (!user) return false;
    
    // Check if announcement is for this user's role
    if (announcement.audience.roles && announcement.audience.roles.includes(user.role)) {
      return true;
    }
    
    // Check if announcement is for classes this user belongs to
    if (announcement.audience.classes && user.role === 'student') {
      const userClass = mockClasses.find(c => c.students.includes(user.id));
      if (userClass && announcement.audience.classes.includes(userClass.id)) {
        return true;
      }
    }
    
    // Check if announcement is for specific users
    if (announcement.audience.specific && announcement.audience.specific.includes(user.id)) {
      return true;
    }
    
    return false;
  });

  // Statistics based on user role
  let stats = [];
  if (user?.role === 'admin') {
    stats = [
      { 
        title: 'Total Students', 
        value: mockUsers.filter(u => u.role === 'student').length, 
        icon: <Users size={20} />, 
        color: 'blue'
      },
      { 
        title: 'Total Classes', 
        value: mockClasses.length, 
        icon: <BookOpen size={20} />, 
        color: 'green'
      },
      { 
        title: 'Total Teachers', 
        value: mockUsers.filter(u => u.role === 'teacher').length, 
        icon: <Users size={20} />, 
        color: 'purple'
      },
      { 
        title: 'Total Subjects', 
        value: mockSubjects.length, 
        icon: <BookOpen size={20} />, 
        color: 'orange'
      },
    ];
  } else if (user?.role === 'teacher') {
    const teacherClasses = mockClasses.filter(c => c.teacherId === user.id);
    const teacherSubjects = mockSubjects.filter(s => s.teacherId === user.id);
    
    stats = [
      { 
        title: 'My Classes', 
        value: teacherClasses.length, 
        icon: <BookOpen size={20} />, 
        color: 'blue'
      },
      { 
        title: 'My Subjects', 
        value: teacherSubjects.length, 
        icon: <BookOpen size={20} />, 
        color: 'green'
      },
      { 
        title: 'Total Students', 
        value: teacherClasses.reduce((acc, c) => acc + c.students.length, 0), 
        icon: <Users size={20} />, 
        color: 'purple'
      },
    ];
  } else if (user?.role === 'student') {
    const studentClass = mockClasses.find(c => c.students.includes(user.id));
    const studentSubjects = studentClass ? studentClass.subjects.length : 0;
    const studentGrades = mockGrades.filter(g => g.studentId === user.id);
    
    stats = [
      { 
        title: 'My Class', 
        value: studentClass ? `${studentClass.name} ${studentClass.section}` : 'None', 
        icon: <BookOpen size={20} />, 
        color: 'blue'
      },
      { 
        title: 'My Subjects', 
        value: studentSubjects, 
        icon: <BookOpen size={20} />, 
        color: 'green'
      },
      { 
        title: 'Recent Grades', 
        value: studentGrades.length, 
        icon: <Award size={20} />, 
        color: 'purple'
      },
    ];
  }

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user?.name}`} 
        description={`${user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard`} 
      />
      
      <div className="stats-grid">
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
              <AnnouncementsList announcements={filteredAnnouncements} />
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
