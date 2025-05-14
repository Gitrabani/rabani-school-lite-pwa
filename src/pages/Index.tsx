
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Welcome to Rabani School Management System</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          A comprehensive platform for managing school operations, student records, and academic activities.
        </p>
      </div>
      
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
