
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResultFormDownloadButtonProps {
  studentName: string;
  studentId: string;
  grades: any[];
  disabled?: boolean;
}

// This component is now a placeholder that shows feature removed message
const ResultFormDownloadButton: React.FC<ResultFormDownloadButtonProps> = () => {
  const handleClick = () => {
    toast({
      title: "Feature Unavailable",
      description: "The result form download feature has been removed.",
      variant: "default"
    });
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="gap-2 opacity-50"
    >
      <FileText size={16} />
      Result Form (Removed)
    </Button>
  );
};

export default ResultFormDownloadButton;
