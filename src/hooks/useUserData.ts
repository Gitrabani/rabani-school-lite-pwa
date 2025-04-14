
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Define a type for auth users to help TypeScript understand the structure
type AuthUser = {
  id: string;
  email: string | null;
};

export const useUserData = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles from the profiles table
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
      
      // Transform profiles into user objects
      if (profiles) {
        const userList: User[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Unnamed User',
          email: '', // We can't easily get emails without admin access
          role: profile.role as UserRole,
          profileImage: profile.avatar_url || '',
        }));
        
        setUsers(userList);
        console.log('Fetched users:', userList);
      }
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

  // Delete user operation
  const deleteUser = async (userId: string) => {
    try {
      // We can only delete the profile since we don't have admin access
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
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
      });
      return false;
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    deleteUser
  };
};
