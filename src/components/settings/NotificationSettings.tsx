
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

const NotificationSettings = ({ onSave }: { onSave: () => void }) => {
  const [sendNotifications, setSendNotifications] = useState(true);

  return (
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
          <Button onClick={onSave}>Save Notification Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
