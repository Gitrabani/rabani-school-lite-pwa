
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types';

interface UseAnnouncementFormProps {
  mockClasses: Class[];
}

export const useAnnouncementForm = ({ mockClasses }: UseAnnouncementFormProps) => {
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

  return {
    title,
    setTitle,
    content,
    setContent,
    audienceType,
    setAudienceType,
    selectedRoles,
    selectedClasses,
    handleRoleChange: (role: string) => handleCheckboxChange(role, selectedRoles, setSelectedRoles),
    handleClassChange: (classId: string) => handleCheckboxChange(classId, selectedClasses, setSelectedClasses),
    handleCreateAnnouncement,
    isSubmitDisabled: !title || !content
  };
};
