
import * as z from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["admin", "teacher", "student", "parent"], {
    required_error: "Please select a role.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  admissionNumber: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "not-specified"]).optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  parentName: z.string().optional(),
  parentEmail: z.string().optional(),
  parentPhone: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
