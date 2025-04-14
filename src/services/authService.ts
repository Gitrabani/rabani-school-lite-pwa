
import { supabase } from '@/integrations/supabase/client';
import { UserFormValues } from '@/components/users/UserFormSchema';

export const createUser = async (data: UserFormValues) => {
  // Create authentication user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
        role: data.role,
        // Store student details in the user metadata
        ...(data.role === 'student' && {
          admission_number: data.admissionNumber,
          class_name: data.class,
          section: data.section,
          roll_number: data.rollNumber,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          phone_number: data.phoneNumber,
          parent_name: data.parentName,
          parent_email: data.parentEmail,
          parent_phone: data.parentPhone
        })
      }
    }
  });
  
  if (authError) {
    throw authError;
  }
  
  return authData;
};
