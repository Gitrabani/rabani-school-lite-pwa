
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { Class } from "@/types";
import { useSubjects } from "@/hooks/useSubjects";
import SubjectsList from "./SubjectsList";
import AddSubjectDialog from "./AddSubjectDialog";

interface ClassSubjectsSectionProps {
  classData: Class;
}

const ClassSubjectsSection: React.FC<ClassSubjectsSectionProps> = ({
  classData
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const { 
    subjects, 
    availableSubjects,
    isLoading, 
    fetchAvailableSubjects, 
    addSubject, 
    removeSubject 
  } = useSubjects(classData.id);

  // Open add subject dialog and fetch available subjects
  const handleOpenAddSubject = () => {
    fetchAvailableSubjects();
    setShowAddSubject(true);
  };

  // Handle add subject
  const handleAddSubject = async (subjectId: string) => {
    const success = await addSubject(subjectId);
    if (success) {
      // Refresh available subjects
      fetchAvailableSubjects();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Subjects ({subjects.length})</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenAddSubject}
            >
              <BookPlus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SubjectsList 
            subjects={subjects}
            isLoading={isLoading}
            onRemoveSubject={removeSubject}
          />
        </CardContent>
      </Card>

      <AddSubjectDialog
        open={showAddSubject}
        onOpenChange={setShowAddSubject}
        availableSubjects={availableSubjects}
        onAddSubject={handleAddSubject}
      />
    </>
  );
};

export default ClassSubjectsSection;
