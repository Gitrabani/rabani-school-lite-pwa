
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '../context/SettingsContext';
import PageHeader from '../components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettings from '@/components/settings/GeneralSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AccessControlSettings from '@/components/settings/AccessControlSettings';
import BackupSettings from '@/components/settings/BackupSettings';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { saveSettings } = useSettings();

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
          <GeneralSettings onSave={handleSaveSettings} />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings onSave={handleSaveSettings} />
        </TabsContent>
        
        <TabsContent value="access">
          <AccessControlSettings onSave={handleSaveSettings} />
        </TabsContent>
        
        <TabsContent value="backup">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
