
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DownloadReportCardButtonProps {
  studentId: string;
  enabled: boolean;
}

const DownloadReportCardButton: React.FC<DownloadReportCardButtonProps> = ({
  studentId,
  enabled,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://xbolbvnfndouxuwrufun.functions.supabase.co/download-report-card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentId }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        toast({
          variant: "destructive",
          title: "Error",
          description: err.error || "Failed to download report card",
        });
        setLoading(false);
        return;
      }

      // Receive a CSV blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-card.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setLoading(false);
      toast({
        title: "Downloaded",
        description: "Your report card has been downloaded.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report card",
      });
      setLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      disabled={!enabled || loading}
      onClick={handleDownload}
    >
      {loading ? "Downloading..." : "Download Report Card"}
    </Button>
  );
};

export default DownloadReportCardButton;
