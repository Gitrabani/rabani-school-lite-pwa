
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AccessControlSettings = ({ onSave }: { onSave: () => void }) => {
  const [allowParentAccess, setAllowParentAccess] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Control</CardTitle>
        <CardDescription>Manage user access permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Parent Access</h3>
            <p className="text-sm text-gray-500">Allow parents to view their children's information</p>
          </div>
          <Switch 
            checked={allowParentAccess}
            onCheckedChange={setAllowParentAccess}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Teacher Grade Entry</h3>
            <p className="text-sm text-gray-500">Allow teachers to enter and modify grades</p>
          </div>
          <Switch checked={true} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Student Self-Registration</h3>
            <p className="text-sm text-gray-500">Allow students to create their own accounts</p>
          </div>
          <Switch checked={false} />
        </div>
        
        <Separator />
        
        <div className="pt-2 flex justify-end">
          <Button onClick={onSave}>Save Access Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessControlSettings;
