
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Subject } from "@/types";

interface SubjectsListProps {
  subjects: Subject[];
  isLoading: boolean;
  onRemoveSubject: (subjectId: string) => void;
}

const SubjectsList: React.FC<SubjectsListProps> = ({
  subjects,
  isLoading,
  onRemoveSubject
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Loading subjects...
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No subjects in this class
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map(subject => (
        <Badge 
          key={subject.id} 
          variant="secondary" 
          className="px-3 py-1 flex items-center gap-2"
        >
          {subject.name}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-4 w-4 p-0 ml-1" 
            onClick={() => onRemoveSubject(subject.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

export default SubjectsList;
