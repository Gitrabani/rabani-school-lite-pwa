
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AssignmentManagement from '@/components/assignments/AssignmentManagement';
import StudentAssignmentView from '@/components/assignments/StudentAssignmentView';

const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Show teacher management view for teachers, student view for students
  if (user.role === 'teacher') {
    return <AssignmentManagement />;
  } else if (user.role === 'student') {
    return <StudentAssignmentView />;
  } else {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Assignments are not available for your role.
        </p>
      </div>
    );
  }
};

export default AssignmentsPage;
