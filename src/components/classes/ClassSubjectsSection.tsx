
import React, { useState, useEffect } from 'react';
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
import { Class, Subject } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassSubjectsSectionProps {
  classData: Class;
}

const ClassSubjectsSection: React.FC<ClassSubjectsSectionProps> = ({
  classData
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch subjects for this class
  useEffect(() => {
    const fetchClassSubjects = async () => {
      setIsLoading(true);
      try {
        // Get all subjects from this class
        const { data: classSubjectsData, error: classSubjectsError } = await supabase
          .from('class_subjects')
          .select('subject_id')
          .eq('class_id', classData.id);

        if (classSubjectsError) {
          console.error("Error fetching class subjects:", classSubjectsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load subjects for this class.",
          });
          return;
        }

        // If there are subjects, get their details
        if (classSubjectsData.length > 0) {
          const subjectIds = classSubjectsData.map(cs => cs.subject_id);
          
          const formattedSubjects = subjectIds.map(id => ({
            id,
            name: id, // Using the ID as the name since we don't have a subjects table
            teacherId: classData.teacherId || '',
            classes: [classData.id]
          }));
          
          setSubjects(formattedSubjects);
        } else {
          setSubjects([]);
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `An unexpected error occurred: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassSubjects();
  }, [classData.id, classData.teacherId, toast]);

  // Fetch available subjects (not in this class)
  const fetchAvailableSubjects = async () => {
    try {
      // Get all subjects from this class
      const { data: classSubjectsData, error: classSubjectsError } = await supabase
        .from('class_subjects')
        .select('subject_id')
        .eq('class_id', classData.id);

      if (classSubjectsError) {
        console.error("Error fetching class subjects:", classSubjectsError);
        return;
      }

      const existingSubjectIds = classSubjectsData.map(cs => cs.subject_id);
      
      // For now, we'll use a predefined list of subjects
      const allSubjects = [
        "Mathematics", "English", "Science", "History", "Geography", 
        "Physics", "Chemistry", "Biology", "Computer Science", "Art", "Music"
      ];
      
      // Filter out subjects already in this class
      const availableSubjectsList = allSubjects
        .filter(subject => !existingSubjectIds.includes(subject))
        .map(subject => ({
          id: subject,
          name: subject,
          teacherId: classData.teacherId || '',
          classes: []
        }));

      setAvailableSubjects(availableSubjectsList);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  // Open add subject dialog and fetch available subjects
  const handleOpenAddSubject = () => {
    fetchAvailableSubjects();
    setShowAddSubject(true);
  };

  // Add subject to class
  const handleAddSubject = async (subjectId: string) => {
    try {
      // Add subject to class
      const { error } = await supabase
        .from('class_subjects')
        .insert({ class_id: classData.id, subject_id: subjectId });

      if (error) {
        console.error("Error adding subject to class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add subject to class.",
        });
        return;
      }

      // Refresh subject lists
      await fetchAvailableSubjects();
      
      // Find subject in available subjects and add to class subjects
      const subject = availableSubjects.find(s => s.id === subjectId);
      if (subject) {
        setSubjects(prev => [...prev, subject]);
      }

      toast({
        title: "Success",
        description: "Subject added to class successfully.",
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
    }
  };

  // Remove subject from class
  const handleRemoveSubject = async (subjectId: string) => {
    try {
      // Remove subject from class
      const { error } = await supabase
        .from('class_subjects')
        .delete()
        .eq('class_id', classData.id)
        .eq('subject_id', subjectId);

      if (error) {
        console.error("Error removing subject from class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove subject from class.",
        });
        return;
      }

      // Remove subject from state
      setSubjects(prev => prev.filter(s => s.id !== subjectId));

      toast({
        title: "Success",
        description: "Subject removed from class successfully.",
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
      });
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
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Loading subjects...
            </div>
          ) : subjects.length > 0 ? (
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
                    onClick={() => handleRemoveSubject(subject.id)}
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
                          onClick={() => handleAddSubject(subject.id)}
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
