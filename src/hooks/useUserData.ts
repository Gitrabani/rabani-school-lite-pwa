
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useUserData = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
        usersData.users.forEach((user: any) => {
          if (user && user.id) {
            userMetadataMap.set(user.id, user.user_metadata || {});
          }
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

  // Delete user operation
  const deleteUser = async (userId: string) => {
    try {
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
