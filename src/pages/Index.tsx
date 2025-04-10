
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Rabani School Management System</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A comprehensive platform for managing school operations, student records, and academic activities.
        </p>
      </div>
      
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
