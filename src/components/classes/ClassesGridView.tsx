
import React from 'react';
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
import { useUserData } from '@/hooks/useUserData';

interface ClassesGridViewProps {
  classes: Class[];
  onManageClass: (classId: string) => void;
}

const ClassesGridView: React.FC<ClassesGridViewProps> = ({ classes, onManageClass }) => {
  const { users } = useUserData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map(classItem => {
        const teacherName = users.find(u => u.id === classItem.teacherId)?.name || 'Unassigned';
        
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
                    Students ({classItem.students.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {classItem.students.length > 0 ? (
                      classItem.students.slice(0, 3).map((studentId, index) => (
                        <Badge key={index} variant="outline">
                          {users.find(u => u.id === studentId)?.name || `Student ${index + 1}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No students assigned</span>
                    )}
                    {classItem.students.length > 3 && (
                      <Badge variant="outline">+{classItem.students.length - 3} more</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Subjects ({classItem.subjects.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {classItem.subjects.length > 0 ? (
                      classItem.subjects.slice(0, 3).map((subjectId, index) => (
                        <Badge key={index} variant="outline">{subjectId}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No subjects assigned</span>
                    )}
                    {classItem.subjects.length > 3 && (
                      <Badge variant="outline">+{classItem.subjects.length - 3} more</Badge>
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
