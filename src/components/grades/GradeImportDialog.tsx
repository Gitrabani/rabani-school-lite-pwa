
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";
import { parseCSVContent, validateGradeCSV } from '@/utils/gradesCsvUtils';
import { useToast } from '@/hooks/use-toast';

interface GradeImportDialogProps {
  onImport: (data: any[]) => Promise<void>;
}

const GradeImportDialog: React.FC<GradeImportDialogProps> = ({ onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = parseCSVContent(content);
          
          if (!validateGradeCSV(data)) {
            setError("Invalid CSV format. CSV must include 'Student ID' and 'Marks' columns.");
            setIsLoading(false);
            return;
          }
          
          await onImport(data);
          toast({
            title: "Import Successful",
            description: `${data.length} grade entries have been imported`
          });
          setOpen(false);
          setFile(null);
        } catch (error: any) {
          setError(`Error parsing file: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError("Failed to read file");
        setIsLoading(false);
      };
      
      reader.readAsText(file);
    } catch (error: any) {
      setError(`Error importing grades: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import Grades
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Grades</DialogTitle>
          <DialogDescription>
            Upload a CSV file with grade data. The file must include columns for "Student ID" and "Marks".
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Expected format: CSV with Student ID and Marks columns
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeImportDialog;
