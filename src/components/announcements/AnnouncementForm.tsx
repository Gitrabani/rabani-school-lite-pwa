
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import AudienceSelector from './AudienceSelector';
import { Class } from '@/types';

interface AnnouncementFormProps {
  mockClasses: Class[];
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ mockClasses }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'roles' | 'classes'>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const handleCheckboxChange = (value: string, selectedArray: string[], setSelectedArray: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(item => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  const handleCreateAnnouncement = () => {
    if (!title || !content) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in both title and content',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Announcement created',
      description: 'Your announcement has been posted successfully',
    });

    setTitle('');
    setContent('');
    setAudienceType('all');
    setSelectedRoles([]);
    setSelectedClasses([]);
  };

  return (
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
          
          {audienceType !== 'all' && (
            <AudienceSelector 
              audienceType={audienceType} 
              mockClasses={mockClasses}
              selectedRoles={selectedRoles}
              selectedClasses={selectedClasses}
              onRoleChange={(role) => handleCheckboxChange(role, selectedRoles, setSelectedRoles)}
              onClassChange={(classId) => handleCheckboxChange(classId, selectedClasses, setSelectedClasses)}
            />
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
  );
};

export default AnnouncementForm;
