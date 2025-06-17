
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface Exam {
  id: string;
  title: string;
  subject_id: string;
  class_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  instructions: string | null;
  exam_type: string;
  room_number: string | null;
  invigilator_id: string | null;
}

interface ExamFormProps {
  exam?: Exam | null;
  onClose: () => void;
}

const ExamForm: React.FC<ExamFormProps> = ({ exam, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    class_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    total_marks: 100,
    instructions: '',
    exam_type: 'written',
    room_number: '',
    invigilator_id: '',
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchClasses();
    if (exam) {
      setFormData({
        title: exam.title,
        subject_id: exam.subject_id,
        class_id: exam.class_id,
        exam_date: exam.exam_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks,
        instructions: exam.instructions || '',
        exam_type: exam.exam_type,
        room_number: exam.room_number || '',
        invigilator_id: exam.invigilator_id || '',
      });
    }
  }, [exam]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, section')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const examData = {
        ...formData,
        created_by: user.id,
        duration_minutes: Number(formData.duration_minutes),
        total_marks: Number(formData.total_marks),
      };

      if (exam) {
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', exam.id);

        if (error) throw error;
      } else {
        const { data: newExam, error } = await supabase
          .from('exams')
          .insert(examData)
          .select()
          .single();

        if (error) throw error;

        // Check for conflicts after creating the exam
        if (newExam) {
          const { data: conflicts } = await supabase
            .rpc('detect_exam_conflicts', { exam_id: newExam.id });

          if (conflicts && conflicts.length > 0) {
            // Insert conflict records
            for (const conflict of conflicts) {
              await supabase
                .from('exam_conflicts')
                .insert({
                  exam1_id: newExam.id,
                  exam2_id: conflict.conflict_exam_id,
                  conflict_type: conflict.conflict_type,
                  conflict_details: conflict.conflict_details,
                });
            }

            toast({
              variant: 'destructive',
              title: 'Conflicts Detected',
              description: `${conflicts.length} scheduling conflict(s) found. Please review.`,
            });
          }
        }
      }

      toast({
        title: 'Success',
        description: exam ? 'Exam updated successfully' : 'Exam scheduled successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save exam',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exam ? 'Edit Exam' : 'Schedule New Exam'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="subject_id">Subject</Label>
              <Input
                id="subject_id"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                placeholder="e.g., Mathematics"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class_id">Class</Label>
              <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exam_type">Exam Type</Label>
              <Select value={formData.exam_type} onValueChange={(value) => setFormData({ ...formData, exam_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="written">Written</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="oral">Oral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exam_date">Exam Date</Label>
              <Input
                id="exam_date"
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="total_marks">Total Marks</Label>
              <Input
                id="total_marks"
                type="number"
                value={formData.total_marks}
                onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="room_number">Room Number</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                placeholder="e.g., Room 101"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Special instructions for the exam..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : exam ? 'Update Exam' : 'Schedule Exam'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamForm;
