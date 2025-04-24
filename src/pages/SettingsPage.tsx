
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/shared/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { 
    schoolName, setSchoolName,
    academicYear, setAcademicYear, 
    saveSettings 
  } = useSettings();
  
  const [sendNotifications, setSendNotifications] = useState(true);
  const [allowParentAccess, setAllowParentAccess] = useState(true);

  const handleSaveSettings = () => {
    const success = saveSettings();
    
    if (success) {
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'There was a problem saving your settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Manage system settings"
      />

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
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
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Send Email Notifications</h3>
                  <p className="text-sm text-gray-500">Send email notifications for important events</p>
                </div>
                <Switch 
                  checked={sendNotifications}
                  onCheckedChange={setSendNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Attendance Alerts</h3>
                  <p className="text-sm text-gray-500">Notify parents about student absences</p>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Grade Updates</h3>
                  <p className="text-sm text-gray-500">Notify students and parents when grades are updated</p>
                </div>
                <Switch checked={false} />
              </div>
              
              <Separator />
              
              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access">
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
                <Button onClick={handleSaveSettings}>Save Access Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
