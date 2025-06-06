
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthProvider';

interface ReportCardUploadDialogProps {
  studentId: string;
  studentName: string;
}

const ReportCardUploadDialog: React.FC<ReportCardUploadDialogProps> = ({
  studentId,
  studentName
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [examType, setExamType] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a PDF file"
        });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !examType || !user) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique file path
      const fileExt = 'pdf';
      const fileName = `${studentId}/${examType}_${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('report-cards')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save record to database
      const { error: dbError } = await supabase
        .from('report_card_uploads')
        .insert({
          student_id: studentId,
          teacher_id: user.id,
          file_path: fileName,
          file_name: file.name,
          exam_type: examType,
          academic_year: academicYear || null
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Report card uploaded successfully"
      });

      // Reset form
      setFile(null);
      setExamType('');
      setAcademicYear('');
      setOpen(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload report card"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload Report Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Report Card for {studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="examType">Exam Type *</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Midterm">Midterm</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g., 2023-2024"
            />
          </div>

          <div>
            <Label htmlFor="file">PDF File *</Label>
            <div className="mt-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {file && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mr-2" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="ml-2 h-auto p-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !file || !examType}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportCardUploadDialog;
