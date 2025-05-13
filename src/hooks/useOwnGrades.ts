import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
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
            gradesQuery = gradesQuery.limit(100); // Get a representative sample
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
          
          // Since 'subjects' table doesn't exist in Supabase schema, we'll use a hardcoded mapping
          // or fetch subject data from another source in a real application
          // For now, we'll just use the subject IDs as names
          const subjectMap: Record<string, string> = {};
          
          // We would normally fetch from a subjects table, but since it doesn't exist,
          // we'll implement a workaround by using subject IDs as names
          Object.keys(subjectIds).forEach(subjectId => {
            // Format the subject ID to look like a name (e.g., "math_101" -> "Math 101")
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
    };
    
    fetchGrades();
  }, [user, studentId, toast]);

  return { ownGrades, loading, gradesBySubject, subjects, classId };
};
