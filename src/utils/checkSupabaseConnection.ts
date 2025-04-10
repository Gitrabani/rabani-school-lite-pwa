
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the Supabase connection is working correctly
 * @returns Promise with connection status
 */
export async function checkSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  serverVersion?: string;
}> {
  try {
    // Try to query system time from Supabase
    const { data, error } = await supabase.from('profiles').select('count()', { count: 'exact' });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
    
    // If we get here, the connection is working
    return {
      success: true,
      message: 'Connection to Supabase is working correctly',
      serverVersion: 'Connected to Supabase project: xbolbvnfndouxuwrufun',
    };
  } catch (err: any) {
    console.error('Error testing Supabase connection:', err);
    return {
      success: false,
      message: `Connection error: ${err.message || 'Unknown error'}`,
    };
  }
}
