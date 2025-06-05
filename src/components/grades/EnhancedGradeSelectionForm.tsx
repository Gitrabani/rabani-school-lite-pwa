
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Assignment {
  id: string;
  name: string;
  type: string;
  maxMarks: number;
  dueDate?: string;
}

interface EnhancedGradeSelectionFormProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedExamType: string;
  setSelectedExamType: (value: string) => void;
  selectedAssignment: string;
  setSelectedAssignment: (value: string) => void;
  classes: any[];
  subjects: any[];
  assignments: Assignment[];
}

const EnhancedGradeSelectionForm: React.FC<EnhancedGradeSelectionFormProps> = ({
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedExamType,
  setSelectedExamType,
  selectedAssignment,
  setSelectedAssignment,
  classes,
  subjects,
  assignments
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Grade Entry Configuration</CardTitle>
        <CardDescription>Select class, subject, assessment type, and specific assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.length === 0 ? (
                  <SelectItem value="no-classes" disabled>Loading classes...</SelectItem>
                ) : (
                  classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.section}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject} 
              disabled={!selectedClass}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Assessment Type</label>
            <Select 
              value={selectedExamType} 
              onValueChange={setSelectedExamType}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="midterm">Midterm Exam</SelectItem>
                <SelectItem value="final">Final Exam</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Specific Assignment</label>
            <Select 
              value={selectedAssignment} 
              onValueChange={setSelectedAssignment}
              disabled={!selectedExamType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Entry</SelectItem>
                {assignments.map(assignment => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    <div className="flex items-center space-x-2">
                      <span>{assignment.name}</span>
                      <Badge variant="secondary">{assignment.maxMarks} pts</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedAssignment && selectedAssignment !== 'general' && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            {(() => {
              const assignment = assignments.find(a => a.id === selectedAssignment);
              return assignment ? (
                <div className="text-sm">
                  <div className="font-medium">{assignment.name}</div>
                  <div className="text-muted-foreground">
                    Type: {assignment.type} | Max Marks: {assignment.maxMarks}
                    {assignment.dueDate && ` | Due: ${assignment.dueDate}`}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedGradeSelectionForm;
