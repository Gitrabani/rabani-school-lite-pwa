
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

    return true;
  };

  return {
    validateSession
  };
};
