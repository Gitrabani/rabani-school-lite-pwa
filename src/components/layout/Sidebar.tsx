
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Settings,
  BookOpen,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['admin'] },
  { name: 'Classes', href: '/dashboard/classes', icon: GraduationCap, roles: ['admin', 'teacher', 'student'] },
  { name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Grades', href: '/dashboard/grades', icon: BarChart3, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Assignments', href: '/dashboard/assignments', icon: BookOpen, roles: ['teacher', 'student'] },
  { name: 'Exams', href: '/dashboard/exams', icon: Calendar, roles: ['admin', 'teacher'] },
  { name: 'Announcements', href: '/dashboard/announcements', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Filter navigation items based on user role
  const navigation = allNavigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">School Management</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
