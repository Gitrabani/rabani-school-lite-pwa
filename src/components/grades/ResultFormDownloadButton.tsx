
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleDownload = async () => {
    toast({
      title: "Feature Removed",
      description: "The PDF generation feature has been removed from the application.",
      variant: "default",
    });
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || grades.length === 0}
      variant="default"
      className="gap-2"
    >
      <FileText size={16} />
      Download Result Form
    </Button>
  );
};

export default ResultFormDownloadButton;
