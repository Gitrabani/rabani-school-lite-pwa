
import React, { useState } from "react";
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
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Class } from "@/types";
import TeacherSelect from "./TeacherSelect";

// Define the form schema with Zod
const assignTeacherSchema = z.object({
  teacherId: z.string().uuid().optional(),
});

type AssignTeacherFormValues = z.infer<typeof assignTeacherSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AssignTeacherFormValues>({
    resolver: zodResolver(assignTeacherSchema),
    defaultValues: {
      teacherId: undefined,
    },
  });

  const handleSubmit = async (data: AssignTeacherFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating class with teacher:", data.teacherId);
      
      // Update the class in Supabase
      const { error } = await supabase
        .from('classes')
        .update({ teacher_id: data.teacherId === 'none' ? null : data.teacherId || null })
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
        description: `Teacher has been ${data.teacherId && data.teacherId !== 'none' ? 'assigned to' : 'removed from'} the class.`,
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
            <TeacherSelect 
              form={form} 
              name="teacherId"
              defaultValue={classData.teacherId || undefined}
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
