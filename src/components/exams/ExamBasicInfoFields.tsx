import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExamBasicInfoFieldsProps {
  formData: {
    title: string;
    subject_id: string;
    class_id: string;
    exam_type: string;
  };
  setFormData: (data: any) => void;
  classes: any[];
  subjects: any[];
}

export const ExamBasicInfoFields: React.FC<ExamBasicInfoFieldsProps> = ({
  formData,
  setFormData,
  classes,
  subjects,
}) => {
  return (
    <>
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
          <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
    </>
  );
};