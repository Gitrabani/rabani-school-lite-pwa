
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { Save } from 'lucide-react';

interface GradeTableHeaderProps {
  role?: UserRole;
  newTotalMarks: string;
  setNewTotalMarks: (value: string) => void;
  onBulkSave?: () => void;
}

const GradeTableHeader: React.FC<GradeTableHeaderProps> = ({ 
  role, 
  newTotalMarks, 
  setNewTotalMarks,
  onBulkSave
}) => {
  const isTeacher = role === 'teacher';

  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row justify-between items-start mb-2">
        <div>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            {isTeacher 
              ? 'Enter grades for each student in this class' 
              : 'View grades for students in this class'
            }
          </CardDescription>
        </div>
        
        {isTeacher && (
          <div className="flex items-center mt-4 md:mt-0 gap-2">
            <div>
              <label htmlFor="total-marks" className="block text-sm mb-1">
                Total Marks
              </label>
              <Input
                id="total-marks"
                type="number"
                className="w-32"
                value={newTotalMarks}
                onChange={(e) => setNewTotalMarks(e.target.value)}
              />
            </div>
            
            {onBulkSave && (
              <Button 
                variant="default" 
                onClick={onBulkSave}
                className="mt-6"
              >
                <Save className="h-4 w-4 mr-2" />
                Save All
              </Button>
            )}
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export default GradeTableHeader;
