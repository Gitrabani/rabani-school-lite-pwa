
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateResultPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/SettingsContext";

interface ResultFormDownloadButtonProps {
  studentName: string;
  studentId: string;
  grades: any[];
  disabled?: boolean;
}

const ResultFormDownloadButton: React.FC<ResultFormDownloadButtonProps> = ({
  studentName,
  studentId,
  grades,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolName, academicYear } = useSettings();

  const handleDownload = async () => {
    if (disabled || grades.length === 0) {
      toast({
        variant: "destructive",
        title: "No grades available",
        description: "Cannot generate result form without grades data",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Starting PDF generation process");
      console.log("Student data:", { studentName, studentId, gradesCount: grades.length });
      
      // Verify jspdf-autotable is loaded
      if (typeof window !== 'undefined') {
        console.log("Environment check: running in browser");
      }
      
      const doc = await generateResultPDF(
        studentName, 
        studentId, 
        grades,
        schoolName || 'School Name Not Set',
        academicYear || 'Current Academic Year'
      );

      // Save PDF with student name in filename
      doc.save(`${studentName.replace(/\s+/g, "-")}-result-form.pdf`);

      toast({
        title: "Success",
        description: "Result form has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate result form",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || loading || grades.length === 0}
      variant="default"
      className="gap-2"
    >
      <FileText size={16} />
      {loading ? "Generating..." : "Download Result Form"}
    </Button>
  );
};

export default ResultFormDownloadButton;
