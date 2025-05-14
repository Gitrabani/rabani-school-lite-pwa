import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth/AuthProvider';

export const useOwnGrades = (studentId?: string) => {
  const { user } = useAuth();
  const [ownGrades, setOwnGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradesBySubject, setGradesBySubject] = useState<Record<string, any[]>>({});
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [classId, setClassId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      
      // If no user is logged in, don't attempt to fetch grades
      if (!user) {
        console.log("No user logged in, skipping grade fetch");
        setLoading(false);
        return;
      }
      
      console.log("Fetching grades for user:", user.role);
      
      // For admin, fetch sample of grades if no specific studentId is provided
      // For students, fetch their own grades
      // For parent/teachers viewing a specific student, use the provided studentId
      let gradesQuery = supabase.from('grades').select('*');
      
      // If we have a specific student ID, use it (for admin viewing specific student or parent view)
      if (studentId) {
        console.log(`Fetching grades for specific student: ${studentId}`);
        gradesQuery = gradesQuery.eq('student_id', studentId);
      } 
      // Otherwise, for students, use their own ID, for admin fetch all (with limit)
      else {
        if (user.role === 'admin') {
          console.log("Admin fetching sample grade data");
          // For admins, get all grades with a reasonable limit to sample the data
          gradesQuery = gradesQuery.limit(100); 
          
          // Check if the table has any data at all for debugging
          const { count, error: countError } = await supabase
            .from('grades')
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error("Error checking grades count:", countError);
          } else {
            console.log(`Total grades in system: ${count || 0}`);
          }
        } else {
          console.log(`User ${user.id} fetching their own grades`);
          gradesQuery = gradesQuery.eq('student_id', user.id);
        }
      }
      
      const { data: gradesData, error: gradesError } = await gradesQuery;
      
      if (gradesError) {
        console.error("Error fetching grades:", gradesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load grades data"
        });
        setLoading(false);
        return;
      }
      
      if (gradesData && gradesData.length > 0) {
        console.log(`Retrieved ${gradesData.length} grades`);
        const subjectIds: Record<string, string> = {};
        const studentClassIds = new Set<string>();
        
        // Fetch subject data for the grades
        for (const grade of gradesData) {
          subjectIds[grade.subject_id] = grade.subject_id;
          studentClassIds.add(grade.class_id);
        }
        
        // If we found a class, store the first one (most typical case for students)
        if (studentClassIds.size > 0) {
          setClassId(Array.from(studentClassIds)[0]);
        }
        
        // Format subject IDs to look like names
        const subjectMap: Record<string, string> = {};
        Object.keys(subjectIds).forEach(subjectId => {
          const formattedName = subjectId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          subjectMap[subjectId] = formattedName;
        });
        
        setSubjects(subjectMap);
        
        // Group grades by subject
        const groupedGrades: Record<string, any[]> = {};
        
        gradesData.forEach(grade => {
          const subjectName = subjectMap[grade.subject_id] || grade.subject_id;
          if (!groupedGrades[subjectName]) {
            groupedGrades[subjectName] = [];
          }
          groupedGrades[subjectName].push(grade);
        });
        
        setGradesBySubject(groupedGrades);
        setOwnGrades(gradesData);
      } else {
        console.log("No grades data found");
        setGradesBySubject({});
        setOwnGrades([]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load grades"
      });
    } finally {
      setLoading(false);
    }
  }, [user, studentId, toast]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return { 
    ownGrades, 
    loading, 
    gradesBySubject, 
    subjects, 
    classId, 
    refetchGrades: fetchGrades 
  };
};
