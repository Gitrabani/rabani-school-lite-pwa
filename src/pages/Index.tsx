
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, BarChart3 } from 'lucide-react';

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Access your school management dashboard
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            School Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your educational institution with our comprehensive management platform
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage student profiles, enrollment, and academic records efficiently
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Handle teacher assignments, schedules, and administrative tasks
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize classes, subjects, and academic curriculum effectively
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate insights and reports for informed decision making
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
