
import React from 'react';
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
import { PlusCircle, Loader2 } from 'lucide-react';
import AudienceSelector from './AudienceSelector';
import { useAnnouncementForm } from '@/hooks/useAnnouncementForm';
import { Class } from '@/types';

interface AnnouncementFormProps {
  mockClasses: Class[];
  onCreateAnnouncement: (title: string, content: string, audience: any) => void;
  isSubmitting: boolean;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ 
  mockClasses,
  onCreateAnnouncement,
  isSubmitting
}) => {
  const {
    title,
    setTitle,
    content,
    setContent,
    audienceType,
    setAudienceType,
    selectedRoles,
    selectedClasses,
    handleRoleChange,
    handleClassChange,
    isSubmitDisabled
  } = useAnnouncementForm({ mockClasses });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let audience = {};
    
    if (audienceType === 'all') {
      audience = { roles: ['admin', 'teacher', 'student', 'parent'] };
    } else if (audienceType === 'roles') {
      audience = { roles: selectedRoles };
    } else if (audienceType === 'classes') {
      audience = { classes: selectedClasses };
    }
    
    onCreateAnnouncement(title, content, audience);
    
    // Reset form
    setTitle('');
    setContent('');
    setAudienceType('all');
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
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              onRoleChange={handleRoleChange}
              onClassChange={handleClassChange}
            />
          )}
          
          <Button 
            type="submit"
            className="w-full" 
            disabled={isSubmitDisabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Announcement'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnnouncementForm;
