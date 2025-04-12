
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Grid, List } from 'lucide-react';
import ClassFormDialog from '@/components/classes/ClassFormDialog';
import ClassDetail from '@/components/classes/ClassDetail';
import { Class } from '@/types';
import ClassesGridView from '@/components/classes/ClassesGridView';
import ClassesListView from '@/components/classes/ClassesListView';
import ClassesPageHeader from '@/components/classes/ClassesPageHeader';
import { useClassData } from '@/hooks/useClassData';
import { Button } from '@/components/ui/button';

const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classFormOpen, setClassFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { classes, loading, refetch } = useClassData();

  const handleAddClass = () => {
    refetch();
    setClassFormOpen(false);
  };

  const handleManageClass = (classId: string) => {
    const classToManage = classes.find(c => c.id === classId);
    if (classToManage) {
      setSelectedClass(classToManage);
    }
  };

  const handleUpdateClass = (updatedClass: Class) => {
    refetch();
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Loading classes...</div>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50 mt-4">
          <h3 className="text-lg font-medium mb-2">No classes found</h3>
          <p className="text-gray-500 mb-4">
            {canAddClass 
              ? "No classes have been created yet. Create your first class to get started."
              : "No classes have been assigned to you yet."}
          </p>
          {canAddClass && (
            <Button onClick={() => setClassFormOpen(true)} className="mt-2">
              Create Class
            </Button>
          )}
        </div>
      ) : (
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
              classes={classes}
              onManageClass={handleManageClass}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <ClassesListView 
              classes={classes}
              onManageClass={handleManageClass}
            />
          </TabsContent>
        </Tabs>
      )}
      
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
