
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Class } from '@/types';

interface AudienceSelectorProps {
  audienceType: 'roles' | 'classes';
  mockClasses: Class[];
  selectedRoles: string[];
  selectedClasses: string[];
  onRoleChange: (role: string) => void;
  onClassChange: (classId: string) => void;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({ 
  audienceType, 
  mockClasses,
  selectedRoles,
  selectedClasses,
  onRoleChange,
  onClassChange
}) => {
  return (
    <div className="space-y-4">
      {audienceType === 'roles' && (
        <>
          <label className="block text-sm font-medium">Select Roles</label>
          <div className="grid grid-cols-2 gap-4">
            {['admin', 'teacher', 'student', 'parent'].map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => onRoleChange(role)}
                />
                <label 
                  htmlFor={`role-${role}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </>
      )}
      
      {audienceType === 'classes' && (
        <>
          <label className="block text-sm font-medium">Select Classes</label>
          <div className="grid grid-cols-2 gap-4">
            {mockClasses.map(classItem => (
              <div key={classItem.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`class-${classItem.id}`}
                  checked={selectedClasses.includes(classItem.id)}
                  onCheckedChange={() => onClassChange(classItem.id)}
                />
                <label 
                  htmlFor={`class-${classItem.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {classItem.name} {classItem.section}
                </label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AudienceSelector;
