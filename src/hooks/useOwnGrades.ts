
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
        
        // Use the studentId parameter if provided (for admin/parent view), otherwise use current user's id
        const effectiveStudentId = studentId || user.id;
        
        // For admin, we need to fetch either all grades or grades for a specific student
        let gradesQuery = supabase
          .from('grades')
          .select('*');
        
        // If it's an admin without specific student ID, fetch sample of grades (could be modified to fetch all)
        if (user.role === 'admin' && !studentId) {
          gradesQuery = gradesQuery.limit(100); // Just get a reasonable amount for admin overview
        } else {
          // For students, parents viewing their child, or admin viewing specific student
          gradesQuery = gradesQuery.eq('student_id', effectiveStudentId);
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
        
        if (gradesData.length > 0) {
          const subjects: Record<string, string> = {};
          const studentClassIds = new Set<string>();
          
          // Fetch subject data for the grades
          for (const grade of gradesData) {
            subjects[grade.subject_id] = grade.subject_id;
            studentClassIds.add(grade.class_id);
          }
          
          // If we found a class, store the first one (most typical case for students)
          if (studentClassIds.size > 0) {
            setClassId(Array.from(studentClassIds)[0]);
          }
          
          // Get subject names
          if (Object.keys(subjects).length > 0) {
            const { data: subjectsData, error: subjectsError } = await supabase
              .from('subjects')
              .select('id, name')
              .in('id', Object.keys(subjects));
            
            if (!subjectsError && subjectsData) {
              const subjectMap: Record<string, string> = {};
              subjectsData.forEach(subject => {
                subjectMap[subject.id] = subject.name;
              });
              setSubjects(subjectMap);
            }
          }
          
          // Group grades by subject
          const groupedGrades: Record<string, any[]> = {};
          
          gradesData.forEach(grade => {
            const subjectName = subjects[grade.subject_id] || grade.subject_id;
            if (!groupedGrades[subjectName]) {
              groupedGrades[subjectName] = [];
            }
            groupedGrades[subjectName].push(grade);
          });
          
          setGradesBySubject(groupedGrades);
          setOwnGrades(gradesData);
        } else {
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
