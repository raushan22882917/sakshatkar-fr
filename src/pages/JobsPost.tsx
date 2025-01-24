import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Filter, Building, Calendar } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type JobPost = Tables<'job_posts'>;

const JobsPost = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Fetch user's applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('job_post_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching applied jobs:', error);
        return;
      }

      setAppliedJobs(data.map(app => app.job_post_id));
    };

    fetchAppliedJobs();
  }, [user]);

  const { data: jobPosts, isLoading } = useQuery({
    queryKey: ['job_posts'],
    queryFn: async () => {
      console.log('Fetching job posts...');
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job posts:', error);
        throw error;
      }
      console.log('Fetched job posts:', data);
      return data as JobPost[];
    },
  });

  const handleApply = async (jobId: string) => {
    try {
      setIsApplying(jobId);
      
      // First get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.resume_url) {
        toast({
          title: "Missing Resume",
          description: "Please upload your resume before applying",
          variant: "destructive",
        });
        return;
      }

      // Create job application with job_post_id
      const { error: applicationError } = await supabase
        .from('job_applications')
        .insert({
          job_post_id: jobId,
          user_id: user?.id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (applicationError) throw applicationError;

      // Update local state to reflect the new application
      setAppliedJobs(prev => [...prev, jobId]);

      toast({
        title: "Application Submitted",
        description: "Your application has been sent successfully!",
      });

    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsApplying(null);
    }
  };

  const filteredJobs = jobPosts?.filter(job => {
    const matchesSearch = job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || job.job_location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Find your <span className="text-blue-500">new job</span> today
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Thousands of jobs in the computer engineering and technology sectors are waiting for you.
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="What position are you looking for?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600">
              Search job
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Filters Section */}
            <div className="w-64 space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Job Type</h4>
                    <div className="space-y-2">
                      {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                        <label key={type} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="checkbox" className="rounded" />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Experience Level</h4>
                    <div className="space-y-2">
                      {['Entry Level', 'Mid Level', 'Senior Level', 'Lead'].map((level) => (
                        <label key={level} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="checkbox" className="rounded" />
                          {level}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs List Section */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {filteredJobs?.length || 0} Jobs Available
                </h2>
                <select className="border rounded-md px-3 py-1 dark:bg-gray-800 dark:text-white">
                  <option>Most recent</option>
                  <option>Deadline approaching</option>
                </select>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs?.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            {job.company_logo ? (
                              <img
                                src={job.company_logo}
                                alt={job.company_name}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <Building className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  {job.job_title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">{job.company_name}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {job.salary_range}
                                </span>
                                <Button
                                  onClick={() => handleApply(job.id)}
                                  disabled={isApplying === job.id || !user || appliedJobs.includes(job.id)}
                                  className={`ml-4 ${
                                    appliedJobs.includes(job.id)
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : 'bg-blue-500 hover:bg-blue-600'
                                  } text-white`}
                                >
                                  {appliedJobs.includes(job.id)
                                    ? 'Applied'
                                    : isApplying === job.id
                                    ? 'Applying...'
                                    : 'Apply Now'}
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {job.job_description}
                            </p>
                            <div className="flex gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {job.job_location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {job.job_type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> 
                                Deadline: {format(new Date(job.application_deadline), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPost;