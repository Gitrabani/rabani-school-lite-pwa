
import React from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import PageHeader from '../components/shared/PageHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardAnnouncements } from '../components/dashboard/DashboardAnnouncements';
import { QuickLinks } from '../components/dashboard/QuickLinks';
import { User } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // Create a compatible User object from AppUser
  const compatibleUser: User | null = user ? {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
    profileImage: user.avatarUrl || undefined
  } : null;

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user?.fullName || 'User'}`} 
        description={`${user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} Dashboard`} 
      />
      
      <DashboardStats user={compatibleUser} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardAnnouncements user={compatibleUser} />
        </div>
        <div>
          <QuickLinks user={compatibleUser} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
