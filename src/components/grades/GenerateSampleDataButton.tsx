
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { useSeedData } from '@/hooks/useSeedData';

interface GenerateSampleDataButtonProps {
  onSuccess?: () => void;
}

const GenerateSampleDataButton: React.FC<GenerateSampleDataButtonProps> = ({ 
  onSuccess 
}) => {
  const { generateSampleGrades, loading } = useSeedData();
  
  const handleGenerateData = async () => {
    const success = await generateSampleGrades();
    if (success && onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleGenerateData}
      disabled={loading}
    >
      <Database className="h-4 w-4 mr-2" />
      {loading ? 'Generating...' : 'Generate Sample Grades'}
    </Button>
  );
};

export default GenerateSampleDataButton;
