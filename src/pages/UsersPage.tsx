import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '../components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { UserPlus } from 'lucide-react';
import { TabsContent, Tabs } from '@/components/ui/tabs';
import { UserRole } from '@/types';
import UserFormDialog from '@/components/users/UserFormDialog';
import StudentDetailsDialog from '@/components/users/StudentDetailsDialog';
import UserRoleTabs from '@/components/users/UserRoleTabs';
import UserSearchHeader from '@/components/users/UserSearchHeader';
import UserTable from '@/components/users/UserTable';
import { useUserData } from '@/hooks/useUserData';
import { useStudentDetails } from '@/hooks/useStudentDetails';
import { useToast } from '@/hooks/use-toast';

// This page should only be accessible by admins
const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<'all' | UserRole>('all');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const { toast } = useToast();

  const { users, loading, fetchUsers, deleteUser } = useUserData();
  const { 
    selectedStudent, 
    detailsDialogOpen, 
    fetchStudentDetails, 
    setDetailsDialogOpen 
  } = useStudentDetails();

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = userRole === 'all' || user.role === userRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    // After adding a user, refresh the users list
    fetchUsers();
    setUserFormOpen(false);
  };

  const handleEditUser = (userId: string) => {
    toast({
      title: "Not implemented",
      description: `Editing user ${userId} would be implemented in a real application.`,
    });
  };

  const roleColorMap: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
    parent: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div>
      <PageHeader 
        title="Users Management" 
        description="Manage users in the system"
        actions={
          <Button onClick={() => setUserFormOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />
      
      <Card>
        <CardHeader>
          <UserSearchHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={userRole} onValueChange={(value) => setUserRole(value as any)}>
            <UserRoleTabs 
              userRole={userRole}
              onRoleChange={setUserRole}
            />
            
            <TabsContent value={userRole}>
              <div className="rounded-md border">
                <UserTable
                  users={filteredUsers}
                  loading={loading}
                  currentUserId={currentUser?.id}
                  roleColorMap={roleColorMap}
                  onViewDetails={fetchStudentDetails}
                  onEdit={handleEditUser}
                  onDelete={deleteUser}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <UserFormDialog 
        open={userFormOpen} 
        onOpenChange={setUserFormOpen} 
        onSubmit={handleAddUser} 
      />
      
      {selectedStudent && (
        <StudentDetailsDialog 
          student={selectedStudent} 
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
};

export default UsersPage;
