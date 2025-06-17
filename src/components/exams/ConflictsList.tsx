
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conflict {
  id: string;
  exam1_id: string;
  exam2_id: string;
  conflict_type: string;
  conflict_details: any;
  resolved: boolean;
}

interface ConflictsListProps {
  conflicts: Conflict[];
  onRefresh: () => void;
}

const ConflictsList: React.FC<ConflictsListProps> = ({ conflicts, onRefresh }) => {
  const { toast } = useToast();

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'time_room_conflict': return 'Room & Time Conflict';
      case 'invigilator_conflict': return 'Invigilator Conflict';
      case 'student_conflict': return 'Student Schedule Conflict';
      default: return 'Unknown Conflict';
    }
  };

  const getConflictDescription = (conflict: Conflict) => {
    const details = conflict.conflict_details;
    switch (conflict.conflict_type) {
      case 'time_room_conflict':
        return `Room ${details.room} is already booked for "${details.exam_title}" on ${details.date} at ${details.time}`;
      case 'invigilator_conflict':
        return `Invigilator is already assigned to "${details.exam_title}" on ${details.date} at ${details.time}`;
      case 'student_conflict':
        return `Students from ${details.class_name} have another exam "${details.exam_title}" on ${details.date} at ${details.time}`;
      default:
        return 'Conflict detected';
    }
  };

  const handleResolveConflict = async (conflictId: string) => {
    try {
      const { error } = await supabase
        .from('exam_conflicts')
        .update({ resolved: true })
        .eq('id', conflictId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Conflict marked as resolved',
      });

      onRefresh();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resolve conflict',
      });
    }
  };

  if (conflicts.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No scheduling conflicts detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict) => (
        <Alert key={conflict.id} className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-orange-700">
                    {getConflictTypeLabel(conflict.conflict_type)}
                  </Badge>
                </div>
                <p className="text-sm text-orange-700">
                  {getConflictDescription(conflict)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveConflict(conflict.id)}
                className="ml-4"
              >
                Mark as Resolved
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ConflictsList;
