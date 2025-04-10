
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BookPlus, X, Plus } from "lucide-react";
import { Subject } from "@/types";

interface ClassSubjectsSectionProps {
  subjects: Subject[];
  availableSubjects: Subject[];
  onAddSubject: (subjectId: string) => void;
  onRemoveSubject: (subjectId: string) => void;
}

const ClassSubjectsSection: React.FC<ClassSubjectsSectionProps> = ({
  subjects,
  availableSubjects,
  onAddSubject,
  onRemoveSubject
}) => {
  const [showAddSubject, setShowAddSubject] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Subjects ({subjects.length})</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddSubject(true)}
            >
              <BookPlus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subjects.length > 0 ? (
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
          ) : (
            <div className="text-center py-4 text-gray-500">
              No subjects in this class
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subject Dialog */}
      <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
            <DialogDescription>
              Select a subject to add to the class
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {availableSubjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableSubjects.map(subject => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onAddSubject(subject.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No available subjects to add
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSubject(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassSubjectsSection;
