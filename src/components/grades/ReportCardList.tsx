
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthProvider';
import { format } from 'date-fns';

interface ReportCard {
  id: string;
  student_id: string;
  teacher_id: string;
  file_path: string;
  file_name: string;
  exam_type: string;
  academic_year: string | null;
  upload_date: string;
}

interface ReportCardListProps {
  studentId: string;
  studentName: string;
}

const ReportCardList: React.FC<ReportCardListProps> = ({ studentId, studentName }) => {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchReportCards();
  }, [studentId]);

  const fetchReportCards = async () => {
    try {
      const { data, error } = await supabase
        .from('report_card_uploads')
        .select('*')
        .eq('student_id', studentId)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setReportCards(data || []);
    } catch (error: any) {
      console.error('Error fetching report cards:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report cards"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportCard: ReportCard) => {
    try {
      const { data, error } = await supabase.storage
        .from('report-cards')
        .download(reportCard.file_path);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = reportCard.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report card downloaded successfully"
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Failed to download report card"
      });
    }
  };

  const handleDelete = async (reportCard: ReportCard) => {
    if (!user || user.role !== 'teacher') return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('report-cards')
        .remove([reportCard.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('report_card_uploads')
        .delete()
        .eq('id', reportCard.id);

      if (dbError) throw dbError;

      setReportCards(prev => prev.filter(rc => rc.id !== reportCard.id));

      toast({
        title: "Success",
        description: "Report card deleted successfully"
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete report card"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading report cards...</p>
        </CardContent>
      </Card>
    );
  }

  if (reportCards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No report cards uploaded for {studentName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Cards for {studentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reportCards.map((reportCard) => (
            <div
              key={reportCard.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">{reportCard.file_name}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{reportCard.exam_type}</Badge>
                    {reportCard.academic_year && (
                      <span>{reportCard.academic_year}</span>
                    )}
                    <span>•</span>
                    <span>{format(new Date(reportCard.upload_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(reportCard)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {user?.role === 'teacher' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(reportCard)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCardList;
