
-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  created_by UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_points NUMERIC NOT NULL DEFAULT 100,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  submission_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  grade NUMERIC,
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for assignments table
CREATE POLICY "Teachers can view assignments for their classes" 
  ON public.assignments 
  FOR SELECT 
  USING (true); -- For now, allow all authenticated users to view

CREATE POLICY "Teachers can create assignments" 
  ON public.assignments 
  FOR INSERT 
  WITH CHECK (true); -- For now, allow all authenticated users to create

CREATE POLICY "Teachers can update their assignments" 
  ON public.assignments 
  FOR UPDATE 
  USING (true); -- For now, allow all authenticated users to update

CREATE POLICY "Teachers can delete their assignments" 
  ON public.assignments 
  FOR DELETE 
  USING (true); -- For now, allow all authenticated users to delete

-- Policies for assignment submissions table
CREATE POLICY "Users can view relevant submissions" 
  ON public.assignment_submissions 
  FOR SELECT 
  USING (true); -- For now, allow all authenticated users to view

CREATE POLICY "Students can create their submissions" 
  ON public.assignment_submissions 
  FOR INSERT 
  WITH CHECK (true); -- For now, allow all authenticated users to create

CREATE POLICY "Students can update their submissions" 
  ON public.assignment_submissions 
  FOR UPDATE 
  USING (true); -- For now, allow all authenticated users to update

CREATE POLICY "Teachers can update submissions for grading" 
  ON public.assignment_submissions 
  FOR UPDATE 
  USING (true); -- For now, allow all authenticated users to update
