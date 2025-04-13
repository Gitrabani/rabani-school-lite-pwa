
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockClasses, mockSubjects } from '@/data/mockData';

interface GradeEntryFormProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedExamType: string;
  setSelectedExamType: (value: string) => void;
  classes: any[];
  user: any;
}

const GradeEntryForm: React.FC<GradeEntryFormProps> = ({
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedExamType,
  setSelectedExamType,
  classes,
  user
}) => {
  const subjects = React.useMemo(() => {
    if (!selectedClass) return [];
    
    const classObj = mockClasses.find(c => c.id === selectedClass);
    if (!classObj) return [];
    
    if (user?.role === 'teacher') {
      return mockSubjects.filter(s => s.teacherId === user.id && classObj.subjects.includes(s.id));
    }
    
    return mockSubjects.filter(s => classObj.subjects.includes(s.id));
  }, [selectedClass, user]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Grade Entry</CardTitle>
        <CardDescription>
          Select class, subject, and exam type to manage grades
        </CardDescription>
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

export default GradeEntryForm;
