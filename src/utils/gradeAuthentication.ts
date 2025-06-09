
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGradeAuthentication = () => {
  const { toast } = useToast();

  const validateSession = async (user: any) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !user) {
      console.error('Grade authentication: No valid session');
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to save grades",
      });
      return false;
    }

    // Additional security check for teacher role
    if (user.role !== 'teacher' && user.role !== 'admin') {
      console.error('Grade authentication: Insufficient permissions');
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only teachers and administrators can save grades",
      });
      return false;
    }

    return true;
  };

  const validateGradeAccess = async (classId: string, subjectId: string) => {
    // Additional validation to ensure teacher has access to this class/subject
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }

    // For now, we'll rely on RLS policies in the database
    // In a full implementation, you might check teacher-class assignments here
    return true;
  };

  return {
    validateSession,
    validateGradeAccess
  };
};
