
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Rabani School Management System</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A comprehensive platform for managing school operations, student records, and academic activities.
        </p>
      </div>
      
      {connectionStatus.checking ? (
        <Alert className="mb-6 max-w-md">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <AlertTitle>Checking Supabase connection...</AlertTitle>
        </Alert>
      ) : connectionStatus.success ? (
        <Alert className="mb-6 max-w-md bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <AlertTitle>Database connection is active</AlertTitle>
          <AlertDescription>
            {connectionStatus.message}
            {connectionStatus.serverVersion && (
              <div className="text-xs mt-1 text-gray-500">{connectionStatus.serverVersion}</div>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 max-w-md bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-500 mr-2" />
          <AlertTitle>Database connection issue</AlertTitle>
          <AlertDescription>
            {connectionStatus.message}
            <div className="text-xs mt-2">
              Please check your SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in src/integrations/supabase/client.ts
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Access the system with your credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Login to Dashboard</Link>
          </Button>
          
          <div className="text-center text-sm text-gray-500 pt-2">
            <p>If you're experiencing any issues, please contact support.</p>
            <p>Version 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
