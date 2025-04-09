
import React from 'react';
import { mockUsers, mockSubjects } from '@/data/mockData';
import { Class } from '@/types';
import { Users, BookOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClassesGridViewProps {
  classes: Class[];
  onManageClass: (classId: string) => void;
}

const ClassesGridView: React.FC<ClassesGridViewProps> = ({ classes, onManageClass }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map(classItem => {
        const teacherName = mockUsers.find(u => u.id === classItem.teacherId)?.name || 'Unassigned';
        const students = mockUsers.filter(u => u.role === 'student' && classItem.students.includes(u.id));
        const subjects = mockSubjects.filter(s => classItem.subjects.includes(s.id));
        
        return (
          <Card key={classItem.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{classItem.name} {classItem.section}</CardTitle>
              <CardDescription>Class Teacher: {teacherName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Students ({students.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {students.length > 0 ? (
                      students.slice(0, 3).map(student => (
                        <Badge key={student.id} variant="outline">{student.name}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No students assigned</span>
                    )}
                    {students.length > 3 && (
                      <Badge variant="outline">+{students.length - 3} more</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Subjects ({subjects.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {subjects.length > 0 ? (
                      subjects.slice(0, 3).map(subject => (
                        <Badge key={subject.id} variant="outline">{subject.name}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No subjects assigned</span>
                    )}
                    {subjects.length > 3 && (
                      <Badge variant="outline">+{subjects.length - 3} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onManageClass(classItem.id)}
              >
                Manage
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ClassesGridView;
