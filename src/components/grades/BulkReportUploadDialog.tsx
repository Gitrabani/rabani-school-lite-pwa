
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthProvider';

interface BulkReportUploadDialogProps {
  classId: string;
}

const BulkReportUploadDialog: React.FC<BulkReportUploadDialogProps> = ({ classId }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [examType, setExamType] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      // Validate all files are PDFs
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i].type !== 'application/pdf') {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: "Please select only PDF files"
          });
          return;
        }
        if (selectedFiles[i].size > 10 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `File ${selectedFiles[i].name} is larger than 10MB`
          });
          return;
        }
      }
      setFiles(selectedFiles);
    }
  };

  const handleBulkUpload = async () => {
    if (!files || !examType || !user || !classId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields and select files"
      });
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Generate unique file path
          const fileName = `bulk_${classId}/${examType}_${Date.now()}_${i}.pdf`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from('report-cards')
            .upload(fileName, file);

          if (uploadError) {
            throw uploadError;
          }

          // Save record to database (assuming student ID is in filename or we create a general record)
          const { error: dbError } = await supabase
            .from('report_card_uploads')
            .insert({
              student_id: 'bulk_upload', // We'll need to handle this differently for actual student mapping
              teacher_id: user.id,
              file_path: fileName,
              file_name: file.name,
              exam_type: examType,
              academic_year: academicYear || null
            });

          if (dbError) {
            throw dbError;
          }

          successCount++;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Bulk Upload Complete",
        description: `${successCount} files uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
      });

      // Reset form
      setFiles(null);
      setExamType('');
      setAcademicYear('');
      setOpen(false);
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload report cards"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileUp className="h-4 w-4 mr-2" />
          Bulk Upload Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Report Cards</DialogTitle>
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
            <Label htmlFor="files">PDF Files *</Label>
            <div className="mt-2">
              <Input
                id="files"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {files && (
              <div className="mt-2 space-y-1">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-muted-foreground">
                    <FileUp className="h-4 w-4 mr-2" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles(null)}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Files
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload} disabled={uploading || !files || !examType}>
              {uploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkReportUploadDialog;
