
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  classes: string[];
}

export interface Student extends User {
  role: 'student';
  admissionNumber: string;
  class: string;
  section: string;
  rollNumber?: string;
  parent?: Parent;
}

export interface Parent extends User {
  role: 'parent';
  children: Student[];
}

export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId?: string;
  students: string[];
  subjects: string[];
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
  classes: string[];
}

export interface Attendance {
  id: string;
  date: string;
  classId: string;
  subjectId?: string;
  records: {
    studentId: string;
    status: 'present' | 'absent' | 'late';
  }[];
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  examType: string; // e.g., 'midterm', 'final', 'quiz'
  marks: number;
  totalMarks: number;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  date: string;
  audience: {
    roles?: UserRole[];
    classes?: string[];
    specific?: string[]; // specific user IDs
  };
}
