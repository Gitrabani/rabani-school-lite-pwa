
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';

const Index: React.FC = () => {
  const { schoolName } = useSettings();
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">School Management System</h1>
          <Link to="/login">
            <Button variant="outline" className="text-white border-white hover:bg-slate-700">
              Login
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-6">
            Welcome to {schoolName} Management System
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            A comprehensive solution for managing school operations, attendance tracking,
            grade management, and communication between teachers, students, and parents.
          </p>
          <div className="space-y-4">
            <Link to="/login">
              <Button size="lg" className="mr-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 {schoolName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
