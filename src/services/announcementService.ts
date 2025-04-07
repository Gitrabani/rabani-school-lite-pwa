
import { supabase } from '../integrations/supabase/client';
import { Announcement } from '../types';

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
    audience: item.audience || {}
  }));
};

export const createAnnouncement = async (
  title: string,
  content: string,
  audience: { roles?: string[], classes?: string[], specific?: string[] }
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
    audience: data.audience || {}
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
