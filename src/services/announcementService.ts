
import { supabase } from '../integrations/supabase/client';
import { Announcement, UserRole } from '../types';
import { Database } from '../integrations/supabase/types';
import { Json } from '../integrations/supabase/types';

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
  
  if (!data) {
    return [];
  }
  
  // Transform to our application's Announcement type
  return data.map(item => ({
    id: item.id || '',
    title: item.title || '',
    content: item.content || '',
    authorId: item.author_id || '',
    date: item.created_at || new Date().toISOString(),
    audience: parseAudience(item.audience)
  }));
};

export const createAnnouncement = async (
  title: string,
  content: string,
  audience: { roles?: UserRole[], classes?: string[], specific?: string[] }
): Promise<Announcement> => {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title,
      content,
      audience
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('No data returned from announcement creation');
  }
  
  return {
    id: data.id || '',
    title: data.title || '',
    content: data.content || '',
    authorId: data.author_id || '',
    date: data.created_at || new Date().toISOString(),
    audience: parseAudience(data.audience)
  };
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

/**
 * Helper function to safely parse the audience JSON from Supabase
 * into our strongly-typed Announcement audience format
 */
const parseAudience = (audienceJson: Json | null): { 
  roles?: UserRole[];
  classes?: string[];
  specific?: string[];
} => {
  if (!audienceJson) {
    return {};
  }

  // Handle case when audienceJson is an object
  if (typeof audienceJson === 'object' && audienceJson !== null) {
    const result: {
      roles?: UserRole[];
      classes?: string[];
      specific?: string[];
    } = {};
    
    // Type guard to check if key exists and value is an array
    const jsonObj = audienceJson as Record<string, unknown>;
    
    if ('roles' in jsonObj && Array.isArray(jsonObj.roles)) {
      result.roles = jsonObj.roles.filter(
        (role): role is UserRole => typeof role === 'string'
      ) as UserRole[];
    }
    
    if ('classes' in jsonObj && Array.isArray(jsonObj.classes)) {
      result.classes = jsonObj.classes.filter(
        (classId): classId is string => typeof classId === 'string'
      );
    }
    
    if ('specific' in jsonObj && Array.isArray(jsonObj.specific)) {
      result.specific = jsonObj.specific.filter(
        (userId): userId is string => typeof userId === 'string'
      );
    }
    
    return result;
  }
  
  // Default empty object if JSON can't be parsed
  return {};
};
