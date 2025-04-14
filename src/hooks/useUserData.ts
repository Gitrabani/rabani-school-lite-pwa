
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
      // First, fetch all profiles from the profiles table
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
      
      // Create a map of user data for quick access
      const userMap = new Map();
      
      if (profiles) {
        profiles.forEach(profile => {
          userMap.set(profile.id, {
            id: profile.id,
            name: profile.full_name || 'Unnamed User',
            email: '', // We'll update this from auth if available
            role: profile.role as UserRole,
            profileImage: profile.avatar_url || '',
          });
        });
      }
      
      // If we can access auth data, try to get emails
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authData && authData.users) {
          const authUsers = authData.users as AuthUser[];
          
          if (Array.isArray(authUsers)) {
            authUsers.forEach(authUser => {
              if (authUser && typeof authUser === 'object' && 'id' in authUser && authUser.id && userMap.has(authUser.id)) {
                const userData = userMap.get(authUser.id);
                if (userData) {
                  userData.email = 'email' in authUser ? (authUser.email || '') : '';
                  userMap.set(authUser.id, userData);
                }
              }
            });
          }
        }
      } catch (authError) {
        console.log("Could not fetch auth users data:", authError);
        // Continue with limited user data
      }
      
      setUsers(Array.from(userMap.values()));
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
      // First try to delete the auth user if we have access
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          console.log("Could not delete auth user:", authError);
          // Continue with deleting profile
        }
      } catch (error) {
        console.log("Auth deletion not available:", error);
        // Continue with deleting profile
      }

      // Delete the profile
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
