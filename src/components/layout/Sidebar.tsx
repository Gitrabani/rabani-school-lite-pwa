import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthProvider';
import { 
  Home, Users, BookOpen, ClipboardCheck, Award, MessageSquare, Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} />, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['admin'] },
    { name: 'Classes', path: '/classes', icon: <BookOpen size={20} />, roles: ['admin', 'teacher'] },
    { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={20} />, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Grades', path: '/grades', icon: <Award size={20} />, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Announcements', path: '/announcements', icon: <MessageSquare size={20} />, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className={`bg-white shadow transition-all duration-300 ${expanded ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="p-4 flex justify-between items-center border-b">
        {expanded ? (
          <h2 className="text-xl font-bold text-gray-900">Rabani SMS</h2>
        ) : (
          <span className="text-xl font-bold">RS</span>
        )}
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-gray-500 hover:text-gray-700"
        >
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      </div>
      
      <nav className="flex-1 pt-4 px-2">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center py-2 px-3 rounded-md
                  ${isActive 
                    ? 'bg-school-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {expanded && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        {expanded ? (
          <div className="text-sm text-gray-500">
            <p className="font-semibold">Rabani School</p>
            <p>Academic Year 2025-26</p>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            <p>2025</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
