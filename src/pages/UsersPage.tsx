
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import PageHeader from '../components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash, UserPlus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserFormDialog from '@/components/users/UserFormDialog';
import { Student, User, UserRole } from '@/types';
import StudentDetailsDialog from '@/components/users/StudentDetailsDialog';
import { useAuth } from '@/context/AuthContext';

// This page should only be accessible by admins
const UsersPage: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<'all' | UserRole>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load users: ${error.message}`,
        });
        return;
      }
      
      // Fetch user data including metadata
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error fetching user metadata:", usersError);
        // Still continue with profile data
      }
      
      // Create a map of user metadata for quick lookup
      const userMetadataMap = new Map();
      if (usersData && usersData.users) {
        usersData.users.forEach(user => {
          userMetadataMap.set(user.id, user.user_metadata);
        });
      }

      // Map profiles to User objects
      const fetchedUsers: User[] = profiles.map(profile => {
        const userMetadata = userMetadataMap.get(profile.id) || {};
        
        return {
          id: profile.id,
          name: profile.full_name || 'Unnamed User',
          email: '', // Email is not stored in the profiles table for privacy
          role: profile.role as UserRole,
          profileImage: profile.avatar_url || '',
        };
      });

      setUsers(fetchedUsers);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = userRole === 'all' || user.role === userRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (userData: any) => {
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

  const handleDeleteUser = async (userId: string) => {
    try {
      // In a real application with proper authentication, 
      // you would need admin privileges and the service role key
      // to delete users from auth.users
      
      // For now, we'll just delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User Deleted",
        description: `User has been removed from the system.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
      });
    }
  };
  
  const handleViewStudentDetails = async (user: User) => {
    if (user.role === 'student') {
      try {
        // Fetch user metadata to get student details
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
        
        if (userError) {
          throw userError;
        }
        
        const userMetadata = userData?.user?.user_metadata || {};
        
        // Combine user data with metadata
        const studentData: Student = {
          ...user,
          role: 'student',
          admissionNumber: userMetadata.admission_number || '',
          class: userMetadata.class_name || '',
          section: userMetadata.section || '',
          rollNumber: userMetadata.roll_number || '',
          dateOfBirth: userMetadata.date_of_birth || '',
          gender: userMetadata.gender || '',
          address: userMetadata.address || '',
          phoneNumber: userMetadata.phone_number || '',
          parentName: userMetadata.parent_name || '',
          parentEmail: userMetadata.parent_email || '',
          parentPhone: userMetadata.parent_phone || '',
        };
        
        setSelectedStudent(studentData);
        setDetailsDialogOpen(true);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load student details: ${error.message}`,
        });
      }
    }
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
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>All Users</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full md:w-[250px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={userRole} onValueChange={(value) => setUserRole(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="teacher">Teachers</TabsTrigger>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="parent">Parents</TabsTrigger>
            </TabsList>
            
            <TabsContent value={userRole}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
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
                                onClick={() => handleViewStudentDetails(user)}
                                title="View student details"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user.id)}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete user"
                              disabled={user.id === currentUser?.id} // Prevent deleting yourself
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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
