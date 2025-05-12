
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
      console.log("School settings:", { schoolName, academicYear });
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error("PDF generation is only available in browser environments");
      }
      
      // Verify if jspdf-autotable is loaded by checking window object
      if (!(window as any).jspdf) {
        console.warn("jsPDF not found in window object, proceeding anyway");
      }
      
      const doc = await generateResultPDF(
        studentName, 
        studentId, 
        grades,
        schoolName || 'School Name Not Set',
        academicYear || 'Current Academic Year'
      );

      // Verify document was created
      if (!doc) {
        throw new Error("Failed to generate PDF document");
      }

      // Try to save the PDF with student name in filename
      const filename = `${studentName.replace(/\s+/g, "-")}-result-form.pdf`;
      console.log("Attempting to save PDF as:", filename);
      doc.save(filename);

      toast({
        title: "Success",
        description: "Result form has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Provide more detailed error message
      let errorMessage = "Failed to generate result form";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "PDF Generation Error",
        description: errorMessage,
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
