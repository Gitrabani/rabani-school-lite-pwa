
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthHeader from '@/components/auth/AuthHeader';
import EmailAuthTabs from '@/components/auth/EmailAuthTabs';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('email');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <AuthHeader 
          title="Create an account" 
          subtitle="Join our platform to connect with properties and people"
        />

        <Tabs defaultValue="email" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6 bg-gray-100 p-1 rounded-md">
            <TabsTrigger value="email" className="rounded-md">Email</TabsTrigger>
            <TabsTrigger value="social" className="rounded-md">Social</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            {activeTab === "email" && <EmailAuthTabs />}
          </TabsContent>
          
          <TabsContent value="social">
            <SocialLoginButtons />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
