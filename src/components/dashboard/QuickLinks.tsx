
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { Link } from 'react-router-dom';

interface QuickLinksProps {
  user: User | null;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          {user?.role === 'teacher' && (
            <>
              <Link to="/attendance" className="block p-2 hover:bg-gray-50 rounded-md">
                Mark Attendance
              </Link>
              <Link to="/grades" className="block p-2 hover:bg-gray-50 rounded-md">
                Enter Grades
              </Link>
            </>
          )}
          {user?.role === 'student' && (
            <>
              <Link to="/attendance" className="block p-2 hover:bg-gray-50 rounded-md">View My Attendance</Link>
              <Link to="/grades" className="block p-2 hover:bg-gray-50 rounded-md">View My Grades</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="block p-2 hover:bg-gray-50 rounded-md">Manage Users</Link>
              <Link to="/classes" className="block p-2 hover:bg-gray-50 rounded-md">Manage Classes</Link>
              <Link to="/announcements" className="block p-2 hover:bg-gray-50 rounded-md">Create Announcement</Link>
            </>
          )}
          <Link to="/announcements" className="block p-2 hover:bg-gray-50 rounded-md">All Announcements</Link>
        </nav>
      </CardContent>
    </Card>
  );
};
