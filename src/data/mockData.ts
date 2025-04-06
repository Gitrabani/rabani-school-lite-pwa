
import { User, Teacher, Student, Admin, Class, Subject, Attendance, Grade, Announcement } from '../types';

// Mock User Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@rabani.edu',
    role: 'admin',
    profileImage: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@rabani.edu',
    role: 'teacher',
    profileImage: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@rabani.edu',
    role: 'teacher',
    profileImage: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Mike Brown',
    email: 'mike@rabani.edu',
    role: 'student',
    profileImage: '/placeholder.svg'
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma@rabani.edu',
    role: 'student',
    profileImage: '/placeholder.svg'
  },
  {
    id: '6',
    name: 'Dave Wilson',
    email: 'dave@example.com',
    role: 'parent',
    profileImage: '/placeholder.svg'
  }
];

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'c1',
    name: 'Grade 10',
    section: 'A',
    teacherId: '2',
    students: ['4'],
    subjects: ['s1', 's2']
  },
  {
    id: 'c2',
    name: 'Grade 9',
    section: 'B',
    teacherId: '3',
    students: ['5'],
    subjects: ['s3', 's4']
  }
];

// Mock Subjects
export const mockSubjects: Subject[] = [
  {
    id: 's1',
    name: 'Mathematics',
    teacherId: '2',
    classes: ['c1']
  },
  {
    id: 's2',
    name: 'Science',
    teacherId: '2',
    classes: ['c1']
  },
  {
    id: 's3',
    name: 'English',
    teacherId: '3',
    classes: ['c2']
  },
  {
    id: 's4',
    name: 'History',
    teacherId: '3',
    classes: ['c2']
  }
];

// Mock Attendance Records
export const mockAttendance: Attendance[] = [
  {
    id: 'a1',
    date: '2025-04-06',
    classId: 'c1',
    subjectId: 's1',
    records: [
      {
        studentId: '4',
        status: 'present'
      }
    ]
  },
  {
    id: 'a2',
    date: '2025-04-06',
    classId: 'c2',
    subjectId: 's3',
    records: [
      {
        studentId: '5',
        status: 'absent'
      }
    ]
  }
];

// Mock Grades
export const mockGrades: Grade[] = [
  {
    id: 'g1',
    studentId: '4',
    subjectId: 's1',
    examType: 'midterm',
    marks: 85,
    totalMarks: 100,
    date: '2025-03-15'
  },
  {
    id: 'g2',
    studentId: '5',
    subjectId: 's3',
    examType: 'midterm',
    marks: 78,
    totalMarks: 100,
    date: '2025-03-15'
  }
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'an1',
    title: 'School Closed for Holiday',
    content: 'School will be closed on Friday for the national holiday.',
    authorId: '1',
    date: '2025-04-03',
    audience: {
      roles: ['teacher', 'student', 'parent']
    }
  },
  {
    id: 'an2',
    title: 'Math Test Next Week',
    content: 'There will be a mathematics test next Tuesday for Grade 10.',
    authorId: '2',
    date: '2025-04-05',
    audience: {
      classes: ['c1']
    }
  }
];

// Helper function to get teachers with extended information
export const getTeachers = (): Teacher[] => {
  return mockUsers
    .filter(user => user.role === 'teacher')
    .map(user => {
      const subjects = mockSubjects.filter(subject => subject.teacherId === user.id).map(s => s.id);
      const classes = mockClasses.filter(c => c.teacherId === user.id).map(c => c.id);
      return {
        ...user,
        role: 'teacher',
        subjects,
        classes
      };
    });
};

// Helper function to get students with extended information
export const getStudents = (): Student[] => {
  return mockUsers
    .filter(user => user.role === 'student')
    .map(user => {
      const classInfo = mockClasses.find(c => c.students.includes(user.id));
      return {
        ...user,
        role: 'student',
        admissionNumber: `A${user.id}`,
        class: classInfo?.name || '',
        section: classInfo?.section || '',
        rollNumber: `R${user.id}`
      };
    });
};
