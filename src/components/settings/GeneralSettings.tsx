
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/context/SettingsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GeneralSettings = ({ onSave }: { onSave: () => void }) => {
  const { 
    schoolName, setSchoolName,
    academicYear, setAcademicYear,
  } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage general system settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">School Name</label>
          <Input 
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Academic Year</label>
          <Input 
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">School Logo</label>
          <div className="flex items-center gap-4">
            <img 
              src="/placeholder.svg"
              alt="School logo"
              className="h-12 w-12 object-contain"
            />
            <Button variant="outline">Change Logo</Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="pt-2 flex justify-end">
          <Button onClick={onSave}>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
