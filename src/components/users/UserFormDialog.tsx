
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/hooks/use-toast";
import { createUser } from "@/services/authService";
import { userFormSchema, UserFormValues } from "./UserFormSchema";
import UserBasicInfoFields from "./UserBasicInfoFields";
import StudentInfoFields from "./StudentInfoFields";
import ParentInfoFields from "./ParentInfoFields";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormValues) => void;
}

const UserFormDialog = ({ open, onOpenChange, onSubmit }: UserFormDialogProps) => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      password: "",
      admissionNumber: "",
      class: "",
      section: "",
      rollNumber: "",
      dateOfBirth: "",
      gender: "not-specified",
      address: "",
      phoneNumber: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    },
  });

  const handleSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Creating new user with role:", data.role);
      
      const authData = await createUser(data);
      
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create user: No user ID returned",
        });
        return;
      }
      
      console.log("User created successfully with ID:", userId);
      
      toast({
        title: "Success",
        description: `User ${data.name} has been created successfully.`,
      });
      
      onSubmit(data);
      form.reset();
    } catch (error: any) {
      console.error("Error in user creation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An error occurred: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account for the school management system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UserBasicInfoFields onRoleChange={handleRoleChange} />

            {selectedRole === "student" && (
              <>
                <StudentInfoFields />
                <ParentInfoFields />
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
