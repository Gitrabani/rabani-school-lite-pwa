
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useExamForm } from './hooks/useExamForm';
import { ExamBasicInfoFields } from './ExamBasicInfoFields';
import { ExamDateTimeFields } from './ExamDateTimeFields';
import { ExamInstructionsField } from './ExamInstructionsField';

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
  const {
    formData,
    setFormData,
    classes,
    subjects,
    loading,
    handleSubmit,
  } = useExamForm({ exam, onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exam ? 'Edit Exam' : 'Schedule New Exam'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ExamBasicInfoFields
            formData={formData}
            setFormData={setFormData}
            classes={classes}
            subjects={subjects}
          />

          <ExamDateTimeFields
            formData={formData}
            setFormData={setFormData}
          />

          <ExamInstructionsField
            formData={formData}
            setFormData={setFormData}
          />

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
