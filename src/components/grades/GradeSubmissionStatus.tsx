
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface GradeSubmissionStatusProps {
  totalStudents: number;
  gradedStudents: number;
  pendingStudents: number;
  hasUnsavedChanges: boolean;
}

const GradeSubmissionStatus: React.FC<GradeSubmissionStatusProps> = ({
  totalStudents,
  gradedStudents,
  pendingStudents,
  hasUnsavedChanges
}) => {
  const completionPercentage = totalStudents > 0 ? (gradedStudents / totalStudents) * 100 : 0;

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Graded: <Badge variant="secondary">{gradedStudents}/{totalStudents}</Badge>
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                Pending: <Badge variant="outline">{pendingStudents}</Badge>
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Progress: {completionPercentage.toFixed(1)}%
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeSubmissionStatus;
