
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useReportCardStatus(studentId: string) {
  const [reportReady, setReportReady] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setReportReady(false);
      return;
    }
    let canceled = false;

    async function checkFinalized() {
      const { data, error } = await supabase
        .from("grades")
        .select("finalized")
        .eq("student_id", studentId);

      if (!canceled) {
        if (!error && data && data.length > 0) {
          setReportReady(data.every((g) => g.finalized));
        } else {
          setReportReady(false);
        }
      }
    }
    checkFinalized();
    return () => {
      canceled = true;
    };
  }, [studentId]);

  return reportReady;
}
