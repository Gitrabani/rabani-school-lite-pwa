
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockClasses } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import AnnouncementTabs from '../components/announcements/AnnouncementTabs';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAnnouncements, createAnnouncement } from '../services/announcementService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query announcements from Supabase
  const { 
    data: announcements = [],
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements
  });

  // Mutation for creating announcements
  const createAnnouncementMutation = useMutation({
    mutationFn: (data: { 
      title: string; 
      content: string; 
      audience: any;
    }) => createAnnouncement(
      data.title, 
      data.content, 
      data.audience
    ),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Announcement created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create announcement: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleCreateAnnouncement = (title: string, content: string, audience: any) => {
    createAnnouncementMutation.mutate({ title, content, audience });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading announcements: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Announcements" 
        description="View and create announcements" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnnouncementTabs announcements={announcements} />
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div>
            <AnnouncementForm 
              mockClasses={mockClasses} 
              onCreateAnnouncement={handleCreateAnnouncement}
              isSubmitting={createAnnouncementMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
