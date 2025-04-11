
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface GradeTableHeaderProps {
  role?: string;
  newTotalMarks: string;
  setNewTotalMarks: (value: string) => void;
}

const GradeTableHeader: React.FC<GradeTableHeaderProps> = ({ 
  role, 
  newTotalMarks, 
  setNewTotalMarks 
}) => {
  return (
    <CardHeader>
      <CardTitle>Student Grades</CardTitle>
      {role === 'teacher' && (
        <div className="flex items-center mt-2">
          <label className="text-sm font-medium mr-3">Total Marks:</label>
          <Input 
            type="number" 
            className="w-24" 
            value={newTotalMarks} 
            onChange={(e) => setNewTotalMarks(e.target.value)}
          />
        </div>
      )}
    </CardHeader>
  );
};

export default GradeTableHeader;
