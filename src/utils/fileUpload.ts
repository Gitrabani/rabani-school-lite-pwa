import { supabase } from '@/integrations/supabase/client';

const UPLOAD_BUCKET = 'message-attachments';

export const uploadMessageFile = async (
  userId: string,
  file: File
): Promise<{ url: string; name: string; size: number }> => {
  try {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Create unique file path
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(UPLOAD_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: publicData.publicUrl,
      name: file.name,
      size: file.size,
    };
  } catch (err: any) {
    console.error('Error uploading file:', err);
    throw new Error(err.message || 'Failed to upload file');
  }
};

export const deleteMessageFile = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .remove([filePath]);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '🎯',
    pptx: '🎯',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    zip: '📦',
    rar: '📦',
  };
  return icons[ext || ''] || '📎';
};
