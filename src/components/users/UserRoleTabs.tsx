
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types';

interface UserRoleTabsProps {
  userRole: 'all' | UserRole;
  onRoleChange: (value: 'all' | UserRole) => void;
}

const UserRoleTabs: React.FC<UserRoleTabsProps> = ({ userRole, onRoleChange }) => {
  return (
    <TabsList className="mb-4">
      <TabsTrigger value="all" onClick={() => onRoleChange('all')}>All</TabsTrigger>
      <TabsTrigger value="admin" onClick={() => onRoleChange('admin')}>Admins</TabsTrigger>
      <TabsTrigger value="teacher" onClick={() => onRoleChange('teacher')}>Teachers</TabsTrigger>
      <TabsTrigger value="student" onClick={() => onRoleChange('student')}>Students</TabsTrigger>
      <TabsTrigger value="parent" onClick={() => onRoleChange('parent')}>Parents</TabsTrigger>
    </TabsList>
  );
};

export default UserRoleTabs;
