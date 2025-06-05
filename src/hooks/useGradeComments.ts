
import { useState } from 'react';

export const useGradeComments = () => {
  const [comments, setComments] = useState<Record<string, string>>({});

  const updateComment = (studentId: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [studentId]: comment
    }));
  };

  const getComment = (studentId: string) => {
    return comments[studentId] || '';
  };

  const clearComments = () => {
    setComments({});
  };

  return {
    comments,
    updateComment,
    getComment,
    clearComments
  };
};
