
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateResultPDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";
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
      const doc = await generateResultPDF(
        studentName, 
        studentId, 
        grades,
        schoolName,
        academicYear
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
        title: "Error",
        description: "Failed to generate result form",
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
