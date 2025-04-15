
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import AnnouncementsList from './AnnouncementsList';
import { Announcement } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface DashboardAnnouncementsProps {
  user: User | null;
}

export const DashboardAnnouncements: React.FC<DashboardAnnouncementsProps> = ({ user }) => {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
        
        // Transform the Supabase data to match our Announcement type
        const transformedAnnouncements = data?.map(item => {
          const audienceData = item.audience as { roles?: string[], classes?: string[], specific?: string[] } | null;
          
          return {
            id: item.id,
            title: item.title,
            content: item.content,
            authorId: item.author_id || '',
            date: item.created_at || new Date().toISOString(),
            audience: {
              roles: audienceData?.roles || [],
              classes: audienceData?.classes || [],
              specific: audienceData?.specific || []
            }
          };
        }) || [];
        
        setAnnouncements(transformedAnnouncements);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

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
  );
};

