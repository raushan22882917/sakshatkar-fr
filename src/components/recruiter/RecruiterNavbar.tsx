import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  {
    name: 'Dashboard',
    href: '/recruiter/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Jobs',
    href: '/recruiter/jobs',
    icon: Briefcase,
    children: [
      {
        name: 'View Jobs',
        href: '/recruiter/jobs',
        icon: Briefcase,
      },
      {
        name: 'Post Job',
        href: '/recruiter/jobs/post',
        icon: PlusCircle,
      },
    ],
  },
  {
    name: 'Applications',
    href: '/recruiter/applications',
    icon: Users,
  },
  {
    name: 'Interviews',
    href: '/recruiter/interviews',
    icon: Calendar,
  },
  {
    name: 'Messages',
    href: '/recruiter/messages',
    icon: MessageSquare,
  },
  {
    name: 'Settings',
    href: '/recruiter/settings',
    icon: Settings,
  },
];

export const RecruiterNavbar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/recruiter/dashboard" className="text-xl font-bold">
                Recruiter Portal
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => 
                item.children ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          'flex items-center px-3 py-2',
                          location.pathname.startsWith(item.href)
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        {item.name}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.name} asChild>
                            <Link
                              to={child.href}
                              className="flex items-center px-4 py-2"
                            >
                              <child.icon className="h-4 w-4 mr-2" />
                              {child.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'inline-flex items-center px-3 py-2 text-sm font-medium',
                      location.pathname === item.href
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Right side - Sign Out */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Show on small screens */}
      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium',
                location.pathname === item.href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default RecruiterNavbar;
