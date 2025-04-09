
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockClasses } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Grid, List } from 'lucide-react';
import ClassFormDialog from '@/components/classes/ClassFormDialog';
import ClassDetail from '@/components/classes/ClassDetail';
import { Class } from '@/types';
import ClassesGridView from '@/components/classes/ClassesGridView';
import ClassesListView from '@/components/classes/ClassesListView';
import ClassesPageHeader from '@/components/classes/ClassesPageHeader';

const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

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
    const classToManage = classes.find(c => c.id === classId);
    if (classToManage) {
      setSelectedClass(classToManage);
    }
  };

  const handleUpdateClass = (updatedClass: Class) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleCloseClassDetail = () => {
    setSelectedClass(null);
  };

  const canAddClass = user?.role === 'admin';

  return (
    <div>
      <ClassesPageHeader 
        canAddClass={canAddClass}
        onAddClass={() => setClassFormOpen(true)}
      />

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid" className="flex items-center">
            <Grid className="h-4 w-4 mr-1" /> Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <List className="h-4 w-4 mr-1" /> List View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <ClassesGridView 
            classes={userClasses}
            onManageClass={handleManageClass}
          />
        </TabsContent>
        
        <TabsContent value="list">
          <ClassesListView 
            classes={userClasses}
            onManageClass={handleManageClass}
          />
        </TabsContent>
      </Tabs>
      
      <ClassFormDialog 
        open={classFormOpen} 
        onOpenChange={setClassFormOpen} 
        onSubmit={handleAddClass} 
      />

      {selectedClass && (
        <ClassDetail
          classData={selectedClass}
          onUpdate={handleUpdateClass}
          onClose={handleCloseClassDetail}
          open={!!selectedClass}
        />
      )}
    </div>
  );
};

export default ClassesPage;
