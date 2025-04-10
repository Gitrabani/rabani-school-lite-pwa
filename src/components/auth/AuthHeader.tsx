
import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
