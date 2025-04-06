
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`stat-card border-l-${color}-500`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <span className={`text-${color}-500`}>{icon}</span>
      </div>
      <div className="font-bold text-2xl text-gray-800">{value}</div>
    </div>
  );
};

export default StatsCard;
