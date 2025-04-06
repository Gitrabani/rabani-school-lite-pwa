
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnnouncementsList from '../dashboard/AnnouncementsList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from 'lucide-react';
import { Announcement } from '@/types';

interface AnnouncementTabsProps {
  announcements: Announcement[];
}

const AnnouncementTabs: React.FC<AnnouncementTabsProps> = ({ announcements }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <AnnouncementsList announcements={announcements} />
          </TabsContent>
          <TabsContent value="recent">
            <AnnouncementsList 
              announcements={announcements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnnouncementTabs;
