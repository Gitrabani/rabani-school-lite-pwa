
import { useState } from 'react';
import { Class } from '@/types';

interface UseAnnouncementFormProps {
  mockClasses: Class[];
}

export const useAnnouncementForm = ({ mockClasses }: UseAnnouncementFormProps) => {
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

  const isSubmitDisabled = !title || !content || 
                         (audienceType === 'roles' && selectedRoles.length === 0) || 
                         (audienceType === 'classes' && selectedClasses.length === 0);

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
    isSubmitDisabled
  };
};
