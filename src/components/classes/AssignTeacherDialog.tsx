
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Class } from "@/types";

// Define the form schema with Zod
const assignTeacherSchema = z.object({
  teacherId: z.string().uuid().optional(),
});

type AssignTeacherFormValues = z.infer<typeof assignTeacherSchema>;
type Teacher = { id: string; name: string };

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class;
  onUpdate: () => void;
}

const AssignTeacherDialog = ({ 
  open, 
  onOpenChange, 
  classData,
  onUpdate
}: AssignTeacherDialogProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AssignTeacherFormValues>({
    resolver: zodResolver(assignTeacherSchema),
    defaultValues: {
      teacherId: classData.teacherId || undefined,
    },
  });

  // Reset form when the dialog opens with current teacher
  useEffect(() => {
    if (open) {
      form.reset({
        teacherId: classData.teacherId || undefined,
      });
    }
  }, [open, classData, form]);
  
  // Fetch teachers from database
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!open) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'teacher');
        
        if (error) {
          console.error("Error fetching teachers:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to load teachers: ${error.message}`,
          });
          return;
        }
        
        const teachersList = (data || []).map(teacher => ({
          id: teacher.id,
          name: teacher.full_name || 'Unknown'
        }));
        
        console.log(`Fetched ${teachersList.length} teachers`);
        setTeachers(teachersList);
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
    
    fetchTeachers();
  }, [open, toast]);

  const handleSubmit = async (data: AssignTeacherFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating class with teacher:", data.teacherId);
      
      // Update the class in Supabase
      const { error } = await supabase
        .from('classes')
        .update({ teacher_id: data.teacherId || null })
        .eq('id', classData.id);
        
      if (error) {
        console.error("Error updating class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update class: ${error.message}`,
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `Teacher has been ${data.teacherId ? 'assigned to' : 'removed from'} the class.`,
      });
      
      // Notify parent component about the update
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message || "Unknown error"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Teacher</DialogTitle>
          <DialogDescription>
            Assign a teacher to {classData.name} {classData.section}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading teachers..." : "Select a teacher"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeacherDialog;
