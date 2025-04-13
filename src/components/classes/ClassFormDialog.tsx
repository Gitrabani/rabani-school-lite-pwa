
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import TeacherSelect from "./TeacherSelect";

// Define the form schema with Zod
const classFormSchema = z.object({
  name: z.string().min(2, {
    message: "Class name must be at least 2 characters.",
  }),
  section: z.string().min(1, {
    message: "Section is required.",
  }),
  teacherId: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClassFormValues) => void;
}

const ClassFormDialog = ({ open, onOpenChange, onSubmit }: ClassFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: "",
      section: "",
      teacherId: undefined,
    },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        section: "",
        teacherId: undefined,
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: ClassFormValues) => {
    setIsLoading(true);
    try {
      console.log("Form data for class creation:", data);
      
      // Create the payload with null for teacherId if not provided
      const payload = {
        name: data.name,
        section: data.section,
        teacher_id: data.teacherId || null
      };
      
      console.log("Payload for Supabase insert:", payload);
      
      // Insert the new class into Supabase
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert(payload)
        .select();
        
      if (error) {
        console.error("Error creating class:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to create class: ${error.message}`,
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `Class ${data.name} ${data.section} has been created.`,
      });
      
      // Pass the data back to the parent component
      onSubmit(data);
      
      // Reset the form
      form.reset();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error.message || "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            Create a new class for the school management system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name<span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Grade 10" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section<span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="A" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <TeacherSelect 
              form={form} 
              name="teacherId" 
              label="Class Teacher"
              placeholder="Select a teacher"
              disabled={isLoading}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassFormDialog;
