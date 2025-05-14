
import { useState } from 'react';
import { seedGradesData } from '@/utils/seedData';

export const useSeedData = () => {
  const [loading, setLoading] = useState(false);
  
  const generateSampleGrades = async () => {
    setLoading(true);
    try {
      const success = await seedGradesData();
      return success;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    generateSampleGrades,
    loading
  };
};
