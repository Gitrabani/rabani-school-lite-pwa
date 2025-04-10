
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkSupabaseConnection } from '@/utils/checkSupabaseConnection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Index = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    checking: boolean;
    success?: boolean;
    message?: string;
    serverVersion?: string;
  }>({
    checking: true
  });

  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus({ checking: true });
      const result = await checkSupabaseConnection();
      setConnectionStatus({
        checking: false,
        success: result.success,
        message: result.message,
        serverVersion: result.serverVersion
      });
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Welcome to Rabani School Management System</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          A comprehensive platform for managing school operations, student records, and academic activities.
        </p>
      </div>
      
      {connectionStatus.checking ? (
        <Alert className="mb-6 max-w-md dark:bg-gray-800 dark:text-gray-200">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <AlertTitle>Checking Supabase connection...</AlertTitle>
        </Alert>
      ) : connectionStatus.success ? (
        <Alert className="mb-6 max-w-md bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100">
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
          <AlertTitle>Database connection is active</AlertTitle>
          <AlertDescription>
            {connectionStatus.message}
            {connectionStatus.serverVersion && (
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{connectionStatus.serverVersion}</div>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 max-w-md bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100">
          <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
          <AlertTitle>Database connection issue</AlertTitle>
          <AlertDescription>
            {connectionStatus.message}
            <div className="text-xs mt-2 dark:text-gray-300">
              Please check your SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in src/integrations/supabase/client.ts
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="w-full max-w-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Getting Started</CardTitle>
          <CardDescription className="dark:text-gray-300">Access the system with your credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Login to Dashboard</Link>
          </Button>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            <p>If you're experiencing any issues, please contact support.</p>
            <p>Version 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
