
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGradesData = () => {
  const [loading, setLoading] = useState(true);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGradesData = async () => {
      try {
        const { data: grades, error } = await supabase
          .from('grades')
          .select('*');

        if (error) {
          throw error;
        }

        if (grades && grades.length > 0) {
          // Calculate grade distribution
          const gradeRanges = [
            { grade: 'A+', min: 95 },
            { grade: 'A', min: 90 },
            { grade: 'B+', min: 85 },
            { grade: 'B', min: 80 },
            { grade: 'C+', min: 75 },
            { grade: 'C', min: 70 },
            { grade: 'D', min: 60 },
            { grade: 'F', min: 0 }
          ];

          const distribution = gradeRanges.map(range => {
            const count = grades.filter(grade => {
              const percentage = (grade.marks / grade.total_marks) * 100;
              return percentage >= range.min && 
                (range.grade === 'A+' ? percentage <= 100 : 
                 percentage < gradeRanges[gradeRanges.indexOf(range) - 1]?.min || 100);
            }).length;
            return {
              grade: range.grade,
              count,
              percentage: grades.length ? Math.round((count / grades.length) * 100) : 0
            };
          });

          setGradeDistribution(distribution);

          // Calculate subject performance
          const subjectStats = new Map();
          
          // Get unique subject IDs
          const subjectIds = [...new Set(grades.map(grade => grade.subject_id))];
          
          // Initialize stats for each subject
          subjectIds.forEach(subjectId => {
            subjectStats.set(subjectId, {
              subject: subjectId,
              totalMarks: 0,
              totalPossible: 0,
              count: 0,
              passed: 0
            });
          });
          
          // Calculate stats for each subject
          grades.forEach(grade => {
            if (!subjectStats.has(grade.subject_id)) return;
            
            const stats = subjectStats.get(grade.subject_id);
            stats.totalMarks += Number(grade.marks);
            stats.totalPossible += Number(grade.total_marks);
            stats.count += 1;
            if ((grade.marks / grade.total_marks) >= 0.6) { // 60% passing grade
              stats.passed += 1;
            }
          });

          const subjectPerf = Array.from(subjectStats.values()).map(stats => ({
            subject: stats.subject,
            avgGrade: Math.round((stats.totalMarks / stats.totalPossible) * 100),
            passRate: stats.count > 0 ? Math.round((stats.passed / stats.count) * 100) : 0
          }));

          setSubjectPerformance(subjectPerf);
        } else {
          // No grades data available, set empty arrays
          setGradeDistribution([]);
          setSubjectPerformance([]);
        }
      } catch (error: any) {
        console.error('Error fetching grades data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load grades data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGradesData();
  }, [toast]);

  return { gradeDistribution, subjectPerformance, loading };
};
