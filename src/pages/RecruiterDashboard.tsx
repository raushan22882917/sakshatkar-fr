import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RecruiterProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  last_login: string;
}

interface DashboardStats {
  total_job_posts: number;
  active_job_posts: number;
  total_applications: number;
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recruiterSession = localStorage.getItem('recruiter_session');
    if (!recruiterSession) {
      navigate('/login');
      return;
    }

    const fetchRecruiterData = async () => {
      try {
        const recruiter = JSON.parse(recruiterSession);
        
        // Fetch recruiter profile
        const { data: profileData, error: profileError } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .eq('id', recruiter.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch dashboard stats
        const { data: statsData, error: statsError } = await supabase
          .from('recruiter_dashboard_stats')
          .select('*')
          .eq('recruiter_id', recruiter.id)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          throw statsError;
        }
        
        setStats(statsData || {
          total_job_posts: 0,
          active_job_posts: 0,
          total_applications: 0
        });

      } catch (error) {
        console.error('Error fetching recruiter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {profile?.first_name} {profile?.last_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profile?.company_name} - Recruiter Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Job Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.total_job_posts || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.active_job_posts || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.total_applications || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Company:</strong> {profile?.company_name}</p>
              <p><strong>Last Login:</strong> {new Date(profile?.last_login || '').toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}