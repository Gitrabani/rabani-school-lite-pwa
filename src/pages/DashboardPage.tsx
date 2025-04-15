
import React from 'react';
import { useAuth } from '../context/auth/AuthProvider';
import PageHeader from '../components/shared/PageHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardAnnouncements } from '../components/dashboard/DashboardAnnouncements';
import { QuickLinks } from '../components/dashboard/QuickLinks';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader 
        title={`Welcome, ${user?.name || 'User'}`} 
        description={`${user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} Dashboard`} 
      />
      
      <DashboardStats user={user} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardAnnouncements user={user} />
        </div>
        <div>
          <QuickLinks user={user} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

