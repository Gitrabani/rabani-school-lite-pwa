
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
        const { data: grades } = await supabase
          .from('grades')
          .select('*');

        if (grades) {
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
              percentage: (count / grades.length) * 100
            };
          });

          setGradeDistribution(distribution);

          // Calculate subject performance
          const subjectStats = new Map();
          grades.forEach(grade => {
            if (!subjectStats.has(grade.subject_id)) {
              subjectStats.set(grade.subject_id, {
                subject: grade.subject_id,
                totalMarks: 0,
                totalPossible: 0,
                count: 0,
                passed: 0
              });
            }
            const stats = subjectStats.get(grade.subject_id);
            stats.totalMarks += grade.marks;
            stats.totalPossible += grade.total_marks;
            stats.count += 1;
            if ((grade.marks / grade.total_marks) >= 0.6) {
              stats.passed += 1;
            }
          });

          const subjectPerf = Array.from(subjectStats.values()).map(stats => ({
            subject: stats.subject,
            avgGrade: Math.round((stats.totalMarks / stats.totalPossible) * 100),
            passRate: Math.round((stats.passed / stats.count) * 100)
          }));

          setSubjectPerformance(subjectPerf);
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
