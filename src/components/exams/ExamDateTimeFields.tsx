import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ExamDateTimeFieldsProps {
  formData: {
    exam_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    total_marks: number;
    room_number: string;
  };
  setFormData: (data: any) => void;
}

export const ExamDateTimeFields: React.FC<ExamDateTimeFieldsProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <>
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
    </>
  );
};