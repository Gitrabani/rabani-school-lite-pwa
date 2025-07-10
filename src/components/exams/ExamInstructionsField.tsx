import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExamInstructionsFieldProps {
  formData: {
    instructions: string;
  };
  setFormData: (data: any) => void;
}

export const ExamInstructionsField: React.FC<ExamInstructionsFieldProps> = ({
  formData,
  setFormData,
}) => {
  return (
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
  );
};