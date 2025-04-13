
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserSearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const UserSearchHeader: React.FC<UserSearchHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <CardTitle>All Users</CardTitle>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="w-full md:w-[250px] pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default UserSearchHeader;
