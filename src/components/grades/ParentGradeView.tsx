
import React from 'react';
import { useAuth } from '@/context/auth/AuthProvider';
import { useParentGradeData } from '@/hooks/useParentGradeData';
import ChildSelector from './ChildSelector';
import ChildGradeDisplay from './ChildGradeDisplay';

const ParentGradeView: React.FC = () => {
  const { user } = useAuth();
  
  const {
    loading,
    children,
    selectedChild,
    setSelectedChild,
    childGrades,
    gradesBySubject,
    subjects,
    reportReady
  } = useParentGradeData(user?.id);

  return (
    <div className="space-y-6">
      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onSelectChild={setSelectedChild}
        loading={loading}
        reportReady={reportReady}
      />

      <ChildGradeDisplay
        selectedChild={selectedChild}
        childGrades={childGrades}
        gradesBySubject={gradesBySubject}
        subjects={subjects}
        loading={loading}
      />
    </div>
  );
};

export default ParentGradeView;
