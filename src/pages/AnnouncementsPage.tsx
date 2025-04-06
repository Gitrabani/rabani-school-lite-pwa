
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockAnnouncements, mockClasses, mockUsers } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import AnnouncementsList from '../components/dashboard/AnnouncementsList';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CheckboxItem, CheckboxList } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MessageCircle } from 'lucide-react';

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'roles' | 'classes'>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Get announcements relevant to the current user
  const userAnnouncements = React.useMemo(() => {
    if (!user) return [];
    
    return mockAnnouncements.filter(announcement => {
      // Check if announcement is for user role
      if (announcement.audience.roles && announcement.audience.roles.includes(user.role)) {
        return true;
      }
      
      // Check if announcement is for user's class (for students)
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
  }, [user]);

  const handleCreateAnnouncement = () => {
    if (!title || !content) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in both title and content',
        variant: 'destructive',
      });
      return;
    }

    // This would create a new announcement in a real app
    toast({
      title: 'Announcement created',
      description: 'Your announcement has been posted successfully',
    });

    // Reset form
    setTitle('');
    setContent('');
    setAudienceType('all');
    setSelectedRoles([]);
    setSelectedClasses([]);
  };

  return (
    <div>
      <PageHeader 
        title="Announcements" 
        description="View and create announcements" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                  <AnnouncementsList announcements={userAnnouncements} />
                </TabsContent>
                <TabsContent value="recent">
                  <AnnouncementsList 
                    announcements={userAnnouncements
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Announcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      placeholder="Enter announcement title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <Textarea
                      placeholder="Enter announcement content"
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Audience</label>
                    <Select value={audienceType} onValueChange={(value: any) => setAudienceType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="roles">Specific Roles</SelectItem>
                        <SelectItem value="classes">Specific Classes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {audienceType === 'roles' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Select Roles</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['admin', 'teacher', 'student', 'parent'].map(role => (
                          <div key={role} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`role-${role}`}
                              checked={selectedRoles.includes(role)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRoles([...selectedRoles, role]);
                                } else {
                                  setSelectedRoles(selectedRoles.filter(r => r !== role));
                                }
                              }}
                              className="mr-2"
                            />
                            <label htmlFor={`role-${role}`}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {audienceType === 'classes' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Select Classes</label>
                      <div className="grid grid-cols-2 gap-2">
                        {mockClasses.map(classItem => (
                          <div key={classItem.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`class-${classItem.id}`}
                              checked={selectedClasses.includes(classItem.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClasses([...selectedClasses, classItem.id]);
                                } else {
                                  setSelectedClasses(selectedClasses.filter(c => c !== classItem.id));
                                }
                              }}
                              className="mr-2"
                            />
                            <label htmlFor={`class-${classItem.id}`}>
                              {classItem.name} {classItem.section}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCreateAnnouncement}
                    disabled={!title || !content}
                  >
                    Post Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
