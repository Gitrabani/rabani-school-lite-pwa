
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TranscriptGeneratorProps {
  studentId: string;
}

const TranscriptGenerator: React.FC<TranscriptGeneratorProps> = ({ studentId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTranscript = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // Fetch all finalized grades for the student
      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select(`
          *,
          classes!inner(name, section)
        `)
        .eq('student_id', studentId)
        .eq('finalized', true)
        .order('date', { ascending: true });

      if (gradesError) throw gradesError;

      if (!grades || grades.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data",
          description: "No finalized grades found for transcript generation"
        });
        return;
      }

      // Group grades by subject and calculate totals
      const subjectGrades = grades.reduce((acc: any, grade: any) => {
        if (!acc[grade.subject_id]) {
          acc[grade.subject_id] = {
            subject: grade.subject_id,
            grades: [],
            totalMarks: 0,
            totalPossible: 0,
            className: grade.classes?.name || 'Unknown',
            section: grade.classes?.section || ''
          };
        }
        
        acc[grade.subject_id].grades.push(grade);
        acc[grade.subject_id].totalMarks += Number(grade.marks);
        acc[grade.subject_id].totalPossible += Number(grade.total_marks);
        
        return acc;
      }, {});

      // Calculate overall statistics
      const totalMarks = grades.reduce((sum, grade) => sum + Number(grade.marks), 0);
      const totalPossible = grades.reduce((sum, grade) => sum + Number(grade.total_marks), 0);
      const overallPercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

      // Generate CSV content
      let csvContent = `ACADEMIC TRANSCRIPT\n`;
      csvContent += `Generated on: ${format(new Date(), 'MMMM dd, yyyy')}\n\n`;
      csvContent += `Student Information:\n`;
      csvContent += `Name: ${profile.full_name || 'N/A'}\n`;
      csvContent += `Student ID: ${studentId}\n\n`;
      
      csvContent += `Academic Record:\n`;
      csvContent += `Subject,Class,Exam Type,Marks,Total,Percentage,Date\n`;
      
      // Add all grades
      grades.forEach((grade: any) => {
        const percentage = grade.total_marks > 0 ? (grade.marks / grade.total_marks * 100).toFixed(1) : '0.0';
        csvContent += `"${grade.subject_id}","${grade.classes?.name || 'N/A'} ${grade.classes?.section || ''}","${grade.exam_type}",${grade.marks},${grade.total_marks},${percentage}%,${format(new Date(grade.date), 'MMM dd, yyyy')}\n`;
      });

      csvContent += `\nSubject Summary:\n`;
      csvContent += `Subject,Class,Total Marks,Total Possible,Percentage\n`;
      
      Object.values(subjectGrades).forEach((subject: any) => {
        const percentage = subject.totalPossible > 0 ? (subject.totalMarks / subject.totalPossible * 100).toFixed(1) : '0.0';
        csvContent += `"${subject.subject}","${subject.className} ${subject.section}",${subject.totalMarks},${subject.totalPossible},${percentage}%\n`;
      });

      csvContent += `\nOverall Summary:\n`;
      csvContent += `Total Marks Earned: ${totalMarks}\n`;
      csvContent += `Total Marks Possible: ${totalPossible}\n`;
      csvContent += `Overall Percentage: ${overallPercentage.toFixed(2)}%\n`;
      csvContent += `Number of Subjects: ${Object.keys(subjectGrades).length}\n`;
      csvContent += `Number of Assessments: ${grades.length}\n`;

      // Download the transcript
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transcript_${profile.full_name?.replace(/\s+/g, '_') || 'student'}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Transcript Generated",
        description: "Your academic transcript has been downloaded successfully"
      });

    } catch (error: any) {
      console.error('Error generating transcript:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate transcript: ${error.message}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Academic Transcript
        </CardTitle>
        <CardDescription>
          Generate and download your complete academic transcript with all finalized grades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={generateTranscript}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Transcript...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Academic Transcript
            </>
          )}
        </Button>
        
        <div className="mt-3 text-sm text-muted-foreground">
          <p>Your transcript will include:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>All finalized grades by subject</li>
            <li>Overall academic performance</li>
            <li>Subject-wise grade summaries</li>
            <li>Official transcript formatting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptGenerator;
