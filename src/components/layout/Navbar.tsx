
import React, { useState } from 'react';
import { Menu, Bell, User, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Notification {
  id: string;
  message: string;
  date?: string;
}

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { schoolName } = useSettings();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'New announcement posted', date: new Date().toISOString() },
    { id: '2', message: 'Your attendance has been marked', date: new Date(Date.now() - 3600000).toISOString() },
  ]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const handleLogout = () => {
    logout();
  };

  const navigateToProfile = () => {
    navigate('/dashboard/profile');
  };

  const navigateToSettings = () => {
    navigate('/dashboard/settings');
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Open the notification dialog
    setSelectedNotification(notification);
  };

  const handleCloseNotification = () => {
    // When closing, mark as read by removing from the list
    if (selectedNotification) {
      setNotifications(prev => prev.filter(note => note.id !== selectedNotification.id));
      
      toast({
        title: "Notification read",
        description: "The notification has been marked as read.",
      });
      
      setSelectedNotification(null);
    }
  };

  // Initialize theme on component mount
  React.useEffect(() => {
    // Check for saved theme or system preference
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDarkMode(isDark);
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <header className="bg-white shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {setSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(prev => !prev)}
              className="md:hidden mr-2"
            >
              <Menu size={24} />
              <span className="sr-only">Open menu</span>
            </Button>
          )}
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{schoolName}</h2>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            className="relative"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="w-full">
                      <div className="text-sm font-medium">{notification.message}</div>
                      {notification.date && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notification.date)}
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="p-2">No notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user?.profileImage} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                {user?.name} ({user?.role})
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={navigateToProfile}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={navigateToSettings}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notification Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => selectedNotification && handleCloseNotification()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
            <DialogDescription>
              {selectedNotification?.date && (
                <span className="text-xs text-gray-500">
                  {formatDate(selectedNotification.date)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>{selectedNotification?.message}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCloseNotification}>Mark as Read</Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
