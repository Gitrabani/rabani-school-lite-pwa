
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeachers } from "@/hooks/useTeachers";
import { UseFormReturn } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherSelectProps {
  form: UseFormReturn<any>;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
  required?: boolean;
}

const TeacherSelect: React.FC<TeacherSelectProps> = ({ 
  form, 
  name, 
  label = "Teacher", 
  placeholder = "Select a teacher",
  disabled = false,
  defaultValue,
  required = false
}) => {
  const { teachers, isLoading } = useTeachers();
  
  // Set default value when teachers are loaded and defaultValue is provided
  React.useEffect(() => {
    if (defaultValue && !form.getValues(name) && teachers.length > 0) {
      // Only set if the teacher with the defaultValue exists
      if (teachers.some(teacher => teacher.id === defaultValue)) {
        form.setValue(name, defaultValue);
      }
    }
  }, [teachers, defaultValue, form, name]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ) : (
            <Select
              onValueChange={field.onChange}
              value={field.value || ""}
              disabled={disabled || isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
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
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TeacherSelect;
