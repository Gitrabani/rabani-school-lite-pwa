
-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id),
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  instructions TEXT,
  exam_type TEXT NOT NULL DEFAULT 'written', -- written, practical, oral
  room_number TEXT,
  invigilator_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration_minutes > 0),
  CONSTRAINT valid_marks CHECK (total_marks > 0)
);

-- Create exam_conflicts table to track potential scheduling conflicts
CREATE TABLE public.exam_conflicts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam1_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  exam2_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL, -- time_overlap, room_conflict, invigilator_conflict, student_conflict
  conflict_details JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exams" 
  ON public.exams 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins and teachers can create exams" 
  ON public.exams 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update exams" 
  ON public.exams 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can delete exams" 
  ON public.exams 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- Add RLS policies for exam_conflicts table
ALTER TABLE public.exam_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view conflicts" 
  ON public.exam_conflicts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can manage conflicts" 
  ON public.exam_conflicts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  );

-- Create function to detect exam conflicts
CREATE OR REPLACE FUNCTION detect_exam_conflicts(exam_id UUID)
RETURNS TABLE(
  conflict_exam_id UUID,
  conflict_type TEXT,
  conflict_details JSONB
) AS $$
DECLARE
  exam_record RECORD;
BEGIN
  -- Get the exam details
  SELECT * INTO exam_record FROM public.exams WHERE id = exam_id;
  
  -- Time and room conflicts
  RETURN QUERY
  SELECT 
    e.id as conflict_exam_id,
    'time_room_conflict' as conflict_type,
    jsonb_build_object(
      'exam_title', e.title,
      'room', e.room_number,
      'date', e.exam_date,
      'time', e.start_time || ' - ' || e.end_time
    ) as conflict_details
  FROM public.exams e
  WHERE e.id != exam_id
    AND e.exam_date = exam_record.exam_date
    AND e.room_number = exam_record.room_number
    AND (
      (e.start_time <= exam_record.start_time AND e.end_time > exam_record.start_time)
      OR (e.start_time < exam_record.end_time AND e.end_time >= exam_record.end_time)
      OR (e.start_time >= exam_record.start_time AND e.end_time <= exam_record.end_time)
    );

  -- Invigilator conflicts
  RETURN QUERY
  SELECT 
    e.id as conflict_exam_id,
    'invigilator_conflict' as conflict_type,
    jsonb_build_object(
      'exam_title', e.title,
      'date', e.exam_date,
      'time', e.start_time || ' - ' || e.end_time
    ) as conflict_details
  FROM public.exams e
  WHERE e.id != exam_id
    AND e.exam_date = exam_record.exam_date
    AND e.invigilator_id = exam_record.invigilator_id
    AND e.invigilator_id IS NOT NULL
    AND (
      (e.start_time <= exam_record.start_time AND e.end_time > exam_record.start_time)
      OR (e.start_time < exam_record.end_time AND e.end_time >= exam_record.end_time)
      OR (e.start_time >= exam_record.start_time AND e.end_time <= exam_record.end_time)
    );

  -- Student conflicts (same class, overlapping time)
  RETURN QUERY
  SELECT 
    e.id as conflict_exam_id,
    'student_conflict' as conflict_type,
    jsonb_build_object(
      'exam_title', e.title,
      'class_name', (SELECT name FROM public.classes WHERE id = e.class_id),
      'date', e.exam_date,
      'time', e.start_time || ' - ' || e.end_time
    ) as conflict_details
  FROM public.exams e
  WHERE e.id != exam_id
    AND (
      e.class_id = exam_record.class_id
      OR EXISTS (
        SELECT 1 FROM public.class_students cs1
        JOIN public.class_students cs2 ON cs1.student_id = cs2.student_id
        WHERE cs1.class_id = exam_record.class_id AND cs2.class_id = e.class_id
      )
    )
    AND e.exam_date = exam_record.exam_date
    AND (
      (e.start_time <= exam_record.start_time AND e.end_time > exam_record.start_time)
      OR (e.start_time < exam_record.end_time AND e.end_time >= exam_record.end_time)
      OR (e.start_time >= exam_record.start_time AND e.end_time <= exam_record.end_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_exams_date_time ON public.exams(exam_date, start_time, end_time);
CREATE INDEX idx_exams_class_id ON public.exams(class_id);
CREATE INDEX idx_exams_subject_id ON public.exams(subject_id);
CREATE INDEX idx_exams_invigilator_id ON public.exams(invigilator_id);
CREATE INDEX idx_exam_conflicts_exam_ids ON public.exam_conflicts(exam1_id, exam2_id);
