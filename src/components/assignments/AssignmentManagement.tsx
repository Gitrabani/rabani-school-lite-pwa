
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import AssignmentForm from './AssignmentForm';
import AssignmentList from './AssignmentList';
import AssignmentGrading from './AssignmentGrading';
import { supabase } from '@/integrations/supabase/client';

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

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
}

const AssignmentManagement: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [view, setView] = useState<'list' | 'grading'>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  const fetchClassesAndSubjects = async () => {
    try {
      // Fetch classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name, section');

      if (classesData) {
        setClasses(classesData);
      }

      // For subjects, we'll use mock data since we don't have a subjects table yet
      setSubjects([
        { id: 'math', name: 'Mathematics' },
        { id: 'english', name: 'English' },
        { id: 'science', name: 'Science' },
        { id: 'history', name: 'History' },
        { id: 'geography', name: 'Geography' },
      ]);
    } catch (error) {
      console.error('Error fetching classes and subjects:', error);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (assignment: Assignment) => {
    // For now, we'll just show a message. You can implement edit functionality later.
    alert('Edit functionality coming soon!');
  };

  const handleGrade = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setView('grading');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedAssignment(null);
  };

  if (view === 'grading' && selectedAssignment) {
    return (
      <AssignmentGrading
        assignment={selectedAssignment}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assignment Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <AssignmentList
        onEdit={handleEdit}
        onGrade={handleGrade}
        refreshTrigger={refreshTrigger}
      />

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <AssignmentForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
            classes={classes}
            subjects={subjects}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentManagement;
