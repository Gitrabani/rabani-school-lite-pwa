
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, UserPlus } from 'lucide-react';
import { Class } from '@/types';
import ClassStudentsSection from './ClassStudentsSection';
import ClassSubjectsSection from './ClassSubjectsSection';
import { useAuth } from '@/context/AuthContext';
import AssignTeacherDialog from './AssignTeacherDialog';

interface ClassDetailProps {
  classData: Class;
  onUpdate: (updatedClass: Class) => void;
  onClose: () => void;
  open: boolean;
}

const ClassDetail: React.FC<ClassDetailProps> = ({ 
  classData, 
  onUpdate, 
  onClose,
  open
}) => {
  const [activeTab, setActiveTab] = useState('students');
  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const handleAssignTeacherComplete = () => {
    // We'll refetch the data when this is called
    onUpdate(classData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle className="text-xl mb-1">
              {classData.name} {classData.section}
            </DialogTitle>
            <DialogDescription>
              Manage class details, students and subjects
            </DialogDescription>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAssignTeacherOpen(true)}
                className="flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {classData.teacherId ? "Change Teacher" : "Assign Teacher"}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="py-4">
          <TabsList className="mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <ClassStudentsSection classId={classData.id} />
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <ClassSubjectsSection classId={classData.id} />
          </TabsContent>
        </Tabs>

        {/* Assign Teacher Dialog */}
        <AssignTeacherDialog
          open={assignTeacherOpen}
          onOpenChange={setAssignTeacherOpen}
          classData={classData}
          onUpdate={handleAssignTeacherComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetail;
