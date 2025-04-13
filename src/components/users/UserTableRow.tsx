
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface UserTableRowProps {
  user: User;
  currentUserId?: string;
  roleColorMap: Record<string, string>;
  onViewDetails: (user: User) => void;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ 
  user, 
  currentUserId, 
  roleColorMap, 
  onViewDetails, 
  onEdit, 
  onDelete 
}) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          {user.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={roleColorMap[user.role]}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {user.role === 'student' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(user)}
            title="View student details"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View Details</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(user.id)}
          title="Edit user"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(user.id)}
          title="Delete user"
          disabled={user.id === currentUserId}
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
