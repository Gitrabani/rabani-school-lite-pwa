
import React, { useState } from 'react';
import { mockUsers } from '../data/mockData';
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

// This page should only be accessible by admins
const UsersPage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<'all' | UserRole>('all');
  const [users, setUsers] = useState(mockUsers);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = userRole === 'all' || user.role === userRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (userData: any) => {
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role as UserRole,
      profileImage: '', // Default empty profile image
      ...(userData.role === 'student' && {
        admissionNumber: userData.admissionNumber,
        class: userData.class,
        section: userData.section,
        rollNumber: userData.rollNumber,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        phoneNumber: userData.phoneNumber,
        parentName: userData.parentName,
        parentEmail: userData.parentEmail,
        parentPhone: userData.parentPhone,
      })
    };
    
    setUsers([...users, newUser]);
    setUserFormOpen(false);
    
    toast({
      title: "Success",
      description: `User ${userData.name} has been created successfully.`,
    });
  };

  const handleEditUser = (userId: string) => {
    toast({
      title: "Not implemented",
      description: `Editing user ${userId} would be implemented in a real application.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, you would call an API to delete the user
    setUsers(users.filter(user => user.id !== userId));
    
    toast({
      title: "User Deleted",
      description: `User has been removed from the system.`,
    });
  };
  
  const handleViewStudentDetails = (user: User) => {
    if (user.role === 'student') {
      setSelectedStudent(user as Student);
      setDetailsDialogOpen(true);
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
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
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
                          <TableCell>{user.email}</TableCell>
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
