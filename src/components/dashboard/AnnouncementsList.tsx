
import React from 'react';
import { Announcement } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { mockUsers } from '../../data/mockData';

interface AnnouncementsListProps {
  announcements: Announcement[];
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ announcements }) => {
  return (
    <div className="space-y-4">
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No announcements available</p>
          </CardContent>
        </Card>
      ) : (
        announcements.map((announcement) => {
          const author = mockUsers.find(user => user.id === announcement.authorId);
          return (
            <Card key={announcement.id}>
              <CardHeader className="pb-2">
                <CardTitle>{announcement.title}</CardTitle>
                <CardDescription>
                  Posted by {author?.name || 'Unknown'} • {formatDistanceToNow(new Date(announcement.date), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{announcement.content}</p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground pt-0">
                {announcement.audience.classes ? 
                  `For: ${announcement.audience.classes.map(c => `Class ${c.replace('c', '')}`).join(', ')}` : 
                  announcement.audience.roles ? 
                    `For: ${announcement.audience.roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}` : 
                    'For: Everyone'
                }
              </CardFooter>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default AnnouncementsList;
