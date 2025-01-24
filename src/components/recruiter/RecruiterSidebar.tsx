import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BriefcaseIcon, 
  UsersIcon, 
  LogOut,
  PlusCircle
} from 'lucide-react';

export function RecruiterSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear recruiter session
    localStorage.removeItem('recruiter_session');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Sakshatkar
        </h2>
        <p className="text-gray-400 text-sm">Recruiter Portal</p>
      </div>

      <nav className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-blue-400"
          onClick={() => navigate('/re/dashboard')}
        >
          <LayoutDashboard className="mr-2 h-5 w-5" />
          Dashboard
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-purple-400"
          onClick={() => navigate('/re/jobs')}
        >
          <BriefcaseIcon className="mr-2 h-5 w-5" />
          Jobs
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-green-400"
          onClick={() => navigate('/re/jobs/new')}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Post New Job
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-orange-400"
          onClick={() => navigate('/re/applications')}
        >
          <UsersIcon className="mr-2 h-5 w-5" />
          Applications
        </Button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 hover:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}