
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const TeacherGuidelines: React.FC = () => {
  return (
    <>
      <Separator className="my-8" />
      
      <Card>
        <CardContent className="pt-6">
          <div className="bg-muted p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">Teacher Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Select assignment type and specific assessment before entering grades</li>
              <li>Add meaningful feedback comments for each student</li>
              <li>Use "Save All" to submit all grades at once, or save individually</li>
              <li>Monitor your progress using the status indicator above</li>
              <li>Grades become visible to students and parents once saved</li>
              <li>Comments help students understand their performance and areas for improvement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TeacherGuidelines;
