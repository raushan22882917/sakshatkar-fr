import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecruiterLayout } from '@/components/recruiter/RecruiterLayout';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { JobPostForm } from '@/components/recruiter/JobPostForm';

interface RecruiterStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  recentApplications: number;
}

export function Home() {
  const [recruiterName, setRecruiterName] = useState('');
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentApplications: 0
  });

  useEffect(() => {
    const loadRecruiterData = async () => {
      try {
        // Get recruiter session data
        const sessionData = localStorage.getItem('recruiter_session');
        if (!sessionData) {
          console.error('No session data found');
          throw new Error('Please log in again');
        }

        const recruiter = JSON.parse(sessionData);
        console.log('Loaded recruiter data:', { ...recruiter, password: '[REDACTED]' });
        
        if (!recruiter.id) {
          console.error('No recruiter ID found in session');
          throw new Error('Invalid session data');
        }

        setRecruiterName(recruiter.first_name || 'Recruiter');

        // First, check if job_posts table exists and is accessible
        const { data: jobsCheck, error: jobsCheckError } = await supabase
          .from('job_posts')
          .select('count')
          .limit(1);

        if (jobsCheckError) {
          console.error('Error checking job_posts table:', jobsCheckError);
          // If table doesn't exist, initialize with empty stats
          setStats({
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            recentApplications: 0
          });
          return;
        }

        // Fetch recruiter statistics
        console.log('Fetching job stats for recruiter ID:', recruiter.id);
        const { data: jobStats, error: jobError } = await supabase
          .from('job_posts')
          .select('id, status, created_at')
          .eq('recruiter_id', recruiter.id);

        if (jobError) {
          console.error('Error fetching job stats:', jobError);
          throw jobError;
        }

        console.log('Job stats fetched:', jobStats);

        if (!jobStats || jobStats.length === 0) {
          setStats({
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            recentApplications: 0
          });
          return;
        }

        // Fetch application statistics
        const { data: applicationStats, error: appError } = await supabase
          .from('job_applications')
          .select('id, created_at, job_post_id')
          .in('job_post_id', jobStats.map(job => job.id));

        if (appError) {
          console.error('Error fetching application stats:', appError);
          throw appError;
        }

        console.log('Application stats fetched:', applicationStats);

        // Calculate statistics
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        const stats = {
          totalJobs: jobStats.length,
          activeJobs: jobStats.filter(job => job.status === 'active').length,
          totalApplications: applicationStats?.length || 0,
          recentApplications: applicationStats?.filter(app => 
            new Date(app.created_at) >= thirtyDaysAgo
          ).length || 0
        };

        console.log('Calculated stats:', stats);
        setStats(stats);

      } catch (error: any) {
        console.error('Error loading recruiter data:', error);
        toast({
          title: "Data Loading Error",
          description: error.message || "Failed to load recruiter data. Please refresh the page.",
          variant: "destructive",
        });
        // Initialize with empty stats on error
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          recentApplications: 0
        });
      }
    };

    loadRecruiterData();
  }, []);

  return (
    <RecruiterLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Welcome {recruiterName}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentApplications}</div>
            </CardContent>
          </Card>
        </div>

        <JobPostForm />
      </div>
    </RecruiterLayout>
  );
}
