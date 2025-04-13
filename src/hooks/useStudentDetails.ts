
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Student, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useStudentDetails = () => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStudentDetails = async (user: User) => {
    if (user.role === 'student') {
      setLoading(true);
      try {
        // Fetch user metadata to get student details
        const { data, error } = await supabase.auth.admin.getUserById(user.id);
        
        if (error) {
          throw error;
        }
        
        // Safely access user metadata
        const userMetadata = data?.user?.user_metadata || {};
        
        // Combine user data with metadata
        const studentData: Student = {
          ...user,
          role: 'student',
          admissionNumber: userMetadata.admission_number || '',
          class: userMetadata.class_name || '',
          section: userMetadata.section || '',
          rollNumber: userMetadata.roll_number || '',
          dateOfBirth: userMetadata.date_of_birth || '',
          gender: userMetadata.gender || '',
          address: userMetadata.address || '',
          phoneNumber: userMetadata.phone_number || '',
          parentName: userMetadata.parent_name || '',
          parentEmail: userMetadata.parent_email || '',
          parentPhone: userMetadata.parent_phone || '',
        };
        
        setSelectedStudent(studentData);
        setDetailsDialogOpen(true);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load student details: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    selectedStudent,
    detailsDialogOpen,
    loading,
    fetchStudentDetails,
    setDetailsDialogOpen,
  };
};
