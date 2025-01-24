import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecruiterNavbar } from '@/components/recruiter/RecruiterNavbar';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Users, 
  Mail, 
  Calendar,
  FileText,
  Settings,
  LogOut,
  PieChart,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  scheduledInterviews: number;
}

interface DashboardLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    scheduledInterviews: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch jobs stats
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', user.id);

        // Fetch applications stats
        const { data: applications } = await supabase
          .from('applications')
          .select('*')
          .eq('recruiter_id', user.id);

        // Fetch interviews stats
        const { data: interviews } = await supabase
          .from('interview_invitations')
          .select('*')
          .eq('recruiter_id', user.id);

        setStats({
          totalJobs: jobs?.length || 0,
          activeJobs: jobs?.filter(job => job.status === 'active').length || 0,
          totalApplications: applications?.length || 0,
          pendingApplications: applications?.filter(app => app.status === 'pending').length || 0,
          scheduledInterviews: interviews?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const dashboardLinks: DashboardLink[] = [
    {
      title: "Post Job",
      description: "Create and manage job postings",
      icon: <Briefcase className="h-6 w-6" />,
      href: "/recruiter/jobs/post",
      color: "text-blue-500"
    },
    {
      title: "My Jobs",
      description: "View and manage your job listings",
      icon: <Building className="h-6 w-6" />,
      href: "/recruiter/jobs",
      color: "text-green-500"
    },
    {
      title: "Applications",
      description: "Review candidate applications",
      icon: <FileText className="h-6 w-6" />,
      href: "/recruiter/applications",
      color: "text-purple-500"
    },
    {
      title: "Interviews",
      description: "Schedule and manage interviews",
      icon: <Calendar className="h-6 w-6" />,
      href: "/recruiter/interviews",
      color: "text-yellow-500"
    },
    {
      title: "Messages",
      description: "Communicate with candidates",
      icon: <Mail className="h-6 w-6" />,
      href: "/recruiter/messages",
      color: "text-pink-500"
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/recruiter/settings",
      color: "text-gray-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RecruiterNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} active jobs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApplications} pending reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledInterviews}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled interviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <PieChart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications > 0
                  ? Math.round((stats.scheduledInterviews / stats.totalApplications) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Interview conversion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardLinks.map((link, index) => (
            <Link key={index} to={link.href}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-gray-100 ${link.color}`}>
                      {link.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
