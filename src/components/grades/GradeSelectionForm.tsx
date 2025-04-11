
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GradeSelectionFormProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedExamType: string;
  setSelectedExamType: (value: string) => void;
  classes: any[];
  subjects: any[];
}

const GradeSelectionForm: React.FC<GradeSelectionFormProps> = ({
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedExamType,
  setSelectedExamType,
  classes,
  subjects
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Class and Subject Selection</CardTitle>
        <CardDescription>Select class, subject, and exam type to view and manage grades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.length === 0 ? (
                  <SelectItem value="loading" disabled>Loading classes...</SelectItem>
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
            <label className="block text-sm font-medium mb-1">Exam Type</label>
            <Select 
              value={selectedExamType} 
              onValueChange={setSelectedExamType}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="midterm">Midterm</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeSelectionForm;
