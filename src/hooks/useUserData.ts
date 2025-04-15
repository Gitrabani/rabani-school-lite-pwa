
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
      console.log('Fetching all user profiles...');
      
      // Fetch all profiles from the profiles table with explicit columns
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load users: ${error.message}`,
        });
        setLoading(false);
        return;
      }
      
      // Transform profiles into user objects
      if (profiles && profiles.length > 0) {
        console.log(`Successfully fetched ${profiles.length} profiles:`, profiles);
        
        // Get auth emails for each profile if possible
        const userList: User[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Unnamed User',
          email: '', // We'll leave email empty as we can't easily get it without admin access
          role: profile.role as UserRole || 'student',
          profileImage: profile.avatar_url || '',
        }));
        
        setUsers(userList);
        console.log('Processed users:', userList);
      } else {
        console.log('No profiles found or empty profiles array returned');
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchUsers:', error);
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
      console.log(`Attempting to delete user with ID: ${userId}`);
      
      // We can only delete the profile since we don't have admin access
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting profile:', error);
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
      console.error('Error in deleteUser:', error);
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
