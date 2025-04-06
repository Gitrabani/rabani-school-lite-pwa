
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockAnnouncements, mockClasses } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import AnnouncementTabs from '../components/announcements/AnnouncementTabs';
import AnnouncementForm from '../components/announcements/AnnouncementForm';

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();

  const userAnnouncements = useMemo(() => {
    if (!user) return [];
    
    return mockAnnouncements.filter(announcement => {
      if (announcement.audience.roles && announcement.audience.roles.includes(user.role)) {
        return true;
      }
      
      if (announcement.audience.classes && user.role === 'student') {
        const userClass = mockClasses.find(c => c.students.includes(user.id));
        if (userClass && announcement.audience.classes.includes(userClass.id)) {
          return true;
        }
      }
      
      if (announcement.audience.specific && announcement.audience.specific.includes(user.id)) {
        return true;
      }
      
      return false;
    });
  }, [user]);

  return (
    <div>
      <PageHeader 
        title="Announcements" 
        description="View and create announcements" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnnouncementTabs announcements={userAnnouncements} />
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div>
            <AnnouncementForm mockClasses={mockClasses} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
