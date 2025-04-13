
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from '@/types';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentUserId?: string;
  roleColorMap: Record<string, string>;
  onViewDetails: (user: User) => void;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  loading, 
  currentUserId,
  roleColorMap,
  onViewDetails, 
  onEdit, 
  onDelete 
}) => {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="h-24 text-center">
          Loading users...
        </TableCell>
      </TableRow>
    );
  }

  if (users.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="h-24 text-center">
          No users found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <UserTableRow
            key={user.id}
            user={user}
            currentUserId={currentUserId}
            roleColorMap={roleColorMap}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
