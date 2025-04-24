
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BackupSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>Manage system data backup and restoration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Backup Data</h3>
          <p className="text-sm text-gray-500 mb-4">Create a backup of all system data</p>
          <Button>Create Backup</Button>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Restore Data</h3>
          <p className="text-sm text-gray-500 mb-4">Restore system data from a previous backup</p>
          <div className="flex gap-4">
            <Input type="file" />
            <Button variant="outline">Restore</Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Scheduled Backups</h3>
          <p className="text-sm text-gray-500 mb-4">Configure automatic backups</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Daily automatic backups</p>
            </div>
            <Switch checked={true} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupSettings;
