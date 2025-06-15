
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  created_at: string;
  class_id: string;
  subject_id: string;
  instructions: string;
}

interface AssignmentListProps {
  onEdit: (assignment: Assignment) => void;
  onGrade: (assignment: Assignment) => void;
  refreshTrigger: number;
}

const AssignmentList: React.FC<AssignmentListProps> = ({
  onEdit,
  onGrade,
  refreshTrigger,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch assignments',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment deleted successfully',
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete assignment',
      });
    }
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No assignments created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const dueDate = new Date(assignment.due_date);
        const isOverdue = isPast(dueDate);

        return (
          <Card key={assignment.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignment.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(assignment)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGrade(assignment)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Grade
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {format(dueDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {assignment.total_points} points
                  </div>
                </div>
                <Badge variant={isOverdue ? 'destructive' : 'default'}>
                  {isOverdue ? 'Overdue' : 'Active'}
                </Badge>
              </div>
              {assignment.instructions && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Instructions:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assignment.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssignmentList;
