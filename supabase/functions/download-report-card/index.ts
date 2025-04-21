
/**
 * Supabase Edge Function: download-report-card
 * Securely allows report card PDF download only if the student's grades are finalized.
 */
import { serve } from "https://deno.land/std@0.193.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId } = await req.json();
    if (!studentId) {
      return new Response(JSON.stringify({ error: "Missing studentId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all grades for this student
    const { data: grades, error } = await supabase
      .from("grades")
      .select("marks,total_marks,subject_id,exam_type,date,finalized")
      .eq("student_id", studentId);

    if (error) {
      console.log("[download-report-card] DB error", error);
      return new Response(JSON.stringify({ error: "Could not fetch grades" }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    if (!grades?.length) {
      return new Response(JSON.stringify({ error: "No grades found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }
    // Ensure all grades are finalized
    const allFinalized = grades.every((g) => g.finalized);
    if (!allFinalized) {
      return new Response(
        JSON.stringify({ error: "Report card not yet available (grades not finalized)" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Generate simple CSV as a stand-in for PDF (can be changed to PDF generation)
    const csv = [
      "Subject,Exam Type,Marks,Total Marks,Date",
      ...grades.map(
        (g) =>
          `${g.subject_id},${g.exam_type},${g.marks},${g.total_marks},${g.date}`
      ),
    ].join("\n");

    // Prepare and send the file as a downloadable attachment
    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=report-card-${studentId}.csv`,
      },
      status: 200,
    });
  } catch (err) {
    console.log("[download-report-card] Unexpected error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
