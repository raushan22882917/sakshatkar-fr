import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { BarChart, LineChart, PieChart } from '@/components/ui/charts';

export default function ReRecruiterDashboard() {
  const [recruiterName, setRecruiterName] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome, {recruiterName || 'Recruiter'}!
        </h1>
        <p className="text-gray-600 mt-2">Manage your job postings and applications efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalJobs}</div>
            <p className="text-blue-100 text-sm mt-1">Posted positions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeJobs}</div>
            <p className="text-purple-100 text-sm mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplications}</div>
            <p className="text-green-100 text-sm mt-1">Total received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentApplications}</div>
            <p className="text-orange-100 text-sm mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Add chart component here */}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Job Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {/* Add chart component here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
