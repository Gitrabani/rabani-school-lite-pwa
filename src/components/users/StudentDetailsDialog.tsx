
import React from 'react';
import { Student } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface StudentDetailsDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentDetailsDialog: React.FC<StudentDetailsDialogProps> = ({ student, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Information</DialogTitle>
          <DialogDescription>
            Detailed information about the student.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.profileImage} alt={student.name} />
            <AvatarFallback className="text-lg">{student.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{student.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Admission Number" value={student.admissionNumber} />
          <InfoItem label="Roll Number" value={student.rollNumber || 'N/A'} />
          <InfoItem label="Class" value={student.class} />
          <InfoItem label="Section" value={student.section} />
          <InfoItem label="Date of Birth" value={student.dateOfBirth || 'N/A'} />
          <InfoItem label="Gender" value={student.gender || 'N/A'} />
          <InfoItem label="Phone Number" value={student.phoneNumber || 'N/A'} />
          <InfoItem label="Address" value={student.address || 'N/A'} />
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-medium mb-4">Parent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Parent's Name" value={student.parentName || 'N/A'} />
            <InfoItem label="Parent's Email" value={student.parentEmail || 'N/A'} />
            <InfoItem label="Parent's Phone" value={student.parentPhone || 'N/A'} />
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for displaying information
const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
};

export default StudentDetailsDialog;
