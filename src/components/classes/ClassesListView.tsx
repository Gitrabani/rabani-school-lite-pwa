
import React from 'react';
import { mockUsers } from '@/data/mockData';
import { Class } from '@/types';
import { Users, BookOpen } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

interface ClassesListViewProps {
  classes: Class[];
  onManageClass: (classId: string) => void;
}

const ClassesListView: React.FC<ClassesListViewProps> = ({ classes, onManageClass }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {classes.map(classItem => {
            const teacherName = mockUsers.find(u => u.id === classItem.teacherId)?.name || 'Unassigned';
            const studentCount = classItem.students.length;
            const subjectCount = classItem.subjects.length;
            
            return (
              <div key={classItem.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-gray-50">
                <div>
                  <h3 className="font-medium">{classItem.name} {classItem.section}</h3>
                  <p className="text-sm text-gray-500">Teacher: {teacherName}</p>
                </div>
                
                <div className="flex mt-2 md:mt-0 space-x-4 items-center">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm">{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onManageClass(classItem.id)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassesListView;
