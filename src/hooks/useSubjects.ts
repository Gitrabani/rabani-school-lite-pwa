
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types';

export const useSubjects = (classId: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch subjects for this class
  useEffect(() => {
    if (!classId) {
      setSubjects([]);
      setIsLoading(false);
      return;
    }
    const fetchClassSubjects = async () => {
      setIsLoading(true);
      try {
        // Get all subjects from this class
        const { data: classSubjectsData, error: classSubjectsError } = await supabase
          .from('class_subjects')
          .select('subject_id')
          .eq('class_id', classId);

        if (classSubjectsError) {
          console.error("Error fetching class subjects:", classSubjectsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load subjects for this class.",
          });
          return;
        }

        // If there are subjects, get their details
        if (classSubjectsData.length > 0) {
          const subjectIds = classSubjectsData.map(cs => cs.subject_id);

          const formattedSubjects = subjectIds.map(id => ({
            id,
            name: id, // Using the ID as the name since we don't have a subjects table
            teacherId: '', // This can be updated if needed
            classes: [classId]
          }));

          setSubjects(formattedSubjects);
        } else {
          setSubjects([]);
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `An unexpected error occurred: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassSubjects();
  }, [classId, toast]);

  // Fetch available subjects (not in this class)
  const fetchAvailableSubjects = async () => {
    if (!classId) {
      setAvailableSubjects([]);
      return;
    }
    try {
      // Get all subjects from this class
      const { data: classSubjectsData, error: classSubjectsError } = await supabase
        .from('class_subjects')
        .select('subject_id')
        .eq('class_id', classId);

      if (classSubjectsError) {
        console.error("Error fetching class subjects:", classSubjectsError);
        return;
      }

      const existingSubjectIds = classSubjectsData.map(cs => cs.subject_id);

      // For now, we'll use a predefined list of subjects
      const allSubjects = [
        "Mathematics", "English", "Science", "History", "Geography", 
        "Physics", "Chemistry", "Biology", "Computer Science", "Art", "Music"
      ];

      // Filter out subjects already in this class
      const availableSubjectsList = allSubjects
        .filter(subject => !existingSubjectIds.includes(subject))
        .map(subject => ({
          id: subject,
          name: subject,
          teacherId: '',
          classes: []
        }));

      setAvailableSubjects(availableSubjectsList);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  // Add subject to class
  const addSubject = async (subjectId: string) => {
    if (!classId) return false;
    try {
      // Add subject to class
      const { error } = await supabase
        .from('class_subjects')
        .insert({ class_id: classId, subject_id: subjectId });

      if (error) {
        console.error("Error adding subject to class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add subject to class.",
        });
        return false;
      }

      // Find subject in available subjects and add to class subjects
      const subject = availableSubjects.find(s => s.id === subjectId);
      if (subject) {
        setSubjects(prev => [...prev, subject]);
        setAvailableSubjects(prev => prev.filter(s => s.id !== subjectId));
      }

      toast({
        title: "Success",
        description: "Subject added to class successfully.",
      });

      return true;
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
      return false;
    }
  };

  // Remove subject from class
  const removeSubject = async (subjectId: string) => {
    if (!classId) return false;
    try {
      // Remove subject from class
      const { error } = await supabase
        .from('class_subjects')
        .delete()
        .eq('class_id', classId)
        .eq('subject_id', subjectId);

      if (error) {
        console.error("Error removing subject from class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove subject from class.",
        });
        return false;
      }

      // Remove subject from state
      setSubjects(prev => prev.filter(s => s.id !== subjectId));

      toast({
        title: "Success",
        description: "Subject removed from class successfully.",
      });

      return true;
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
      return false;
    }
  };

  return { 
    subjects, 
    availableSubjects, 
    isLoading, 
    fetchAvailableSubjects, 
    addSubject, 
    removeSubject 
  };
};
