
import React, { useState } from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import { mockClasses, mockSubjects, mockUsers } from '../data/mockData';
import PageHeader from '../components/shared/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Users, BookOpen, GraduationCap, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ClassFormDialog from '@/components/classes/ClassFormDialog';
import { Class } from '@/types';

const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [classFormOpen, setClassFormOpen] = useState(false);

  // Get classes relevant to the current user
  const userClasses = React.useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return classes;
    } else if (user.role === 'teacher') {
      return classes.filter(c => c.teacherId === user.id);
    }
    
    return classes.filter(c => c.students.includes(user.id));
  }, [user, classes]);

  const handleAddClass = (classData: any) => {
    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: classData.name,
      section: classData.section,
      teacherId: classData.teacherId || undefined,
      students: [],
      subjects: [],
    };
    
    setClasses([...classes, newClass]);
    setClassFormOpen(false);
    
    toast({
      title: "Success",
      description: `Class ${classData.name} ${classData.section} has been created successfully.`,
    });
  };

  const handleManageClass = (classId: string) => {
    toast({
      title: "Not implemented",
      description: `Managing class ${classId} would be implemented in a real application.`,
    });
  };

  return (
    <div>
      <PageHeader 
        title="Classes" 
        description="Manage and view classes" 
        actions={
          user?.role === 'admin' ? (
            <Button onClick={() => setClassFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Class
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userClasses.map(classItem => {
              const teacherName = mockUsers.find(u => u.id === classItem.teacherId)?.name || 'Unassigned';
              const students = mockUsers.filter(u => u.role === 'student' && classItem.students.includes(u.id));
              const subjects = mockSubjects.filter(s => classItem.subjects.includes(s.id));
              
              return (
                <Card key={classItem.id}>
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
                            subjects.map(subject => (
                              <Badge key={subject.id} variant="outline">{subject.name}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No subjects assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {user?.role === 'admin' && (
                    <CardFooter className="justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleManageClass(classItem.id)}
                      >
                        Manage
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {userClasses.map(classItem => {
                  const teacherName = mockUsers.find(u => u.id === classItem.teacherId)?.name || 'Unassigned';
                  const studentCount = classItem.students.length;
                  const subjectCount = classItem.subjects.length;
                  
                  return (
                    <div key={classItem.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">{classItem.name} {classItem.section}</h3>
                        <p className="text-sm text-gray-500">Teacher: {teacherName}</p>
                      </div>
                      
                      <div className="flex mt-2 md:mt-0 space-x-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</span>
                        </div>
                        {user?.role === 'admin' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleManageClass(classItem.id)}
                          >
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ClassFormDialog 
        open={classFormOpen} 
        onOpenChange={setClassFormOpen} 
        onSubmit={handleAddClass} 
      />
    </div>
  );
};

export default ClassesPage;
