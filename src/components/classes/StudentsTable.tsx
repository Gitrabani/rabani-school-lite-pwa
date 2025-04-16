
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { User } from "@/types";

interface StudentsTableProps {
  students: User[];
  onRemoveStudent: (studentId: string) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  onRemoveStudent
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
              No students in this class yet
            </TableCell>
          </TableRow>
        ) : (
          students.map(student => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveStudent(student.id)}
                  aria-label={`Remove ${student.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StudentsTable;
