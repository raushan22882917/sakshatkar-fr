import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Filter, Building, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type JobPost = Tables<'job_posts'> & {
  experience_level?: string;
};

const JobsPost = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [jobType, setJobType] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string[]>([]);
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
        .select(`
          *,
          profiles:recruiter_id(
            full_name,
            avatar_url,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job posts:', error);
        throw error;
      }
      console.log('Fetched job posts:', data);
      return data as (JobPost & {
        profiles: {
          full_name: string;
          avatar_url: string | null;
          company_name: string | null;
        } | null;
      })[];
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
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || job.job_location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesJobType = jobType.length === 0 || jobType.includes(job.job_type);
    const matchesExperience = experienceLevel.length === 0 || 
      (job.experience_level && experienceLevel.includes(job.experience_level));
    return matchesSearch && matchesLocation && matchesJobType && matchesExperience;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'deadline') {
      return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
    }
    return 0;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredJobs?.length / itemsPerPage);
  const paginatedJobs = filteredJobs?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const JobList = ({ filteredJobs, handleApply, isApplying, user, appliedJobs }) => {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                Find Your Dream <span className="text-blue-600">Tech Job</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover opportunities in tech, engineering, and digital innovation. Your next career move starts here.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by job title, company, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Location (e.g., City, Country)"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full h-12"
                />
              </div>
              <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white">
                <Filter className="w-4 h-4 mr-2" /> Search Jobs
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Section */}
              <div className="lg:w-72 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-fit">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Filter className="w-4 h-4" /> Filters
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Job Type</h4>
                      <div className="space-y-2">
                        {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                          <label key={type} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600"
                              checked={jobType.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setJobType([...jobType, type]);
                                } else {
                                  setJobType(jobType.filter(t => t !== type));
                                }
                              }}
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Experience Level</h4>
                      <div className="space-y-2">
                        {['Entry Level', 'Mid Level', 'Senior Level', 'Lead'].map((level) => (
                          <label key={level} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600"
                              checked={experienceLevel.includes(level)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExperienceLevel([...experienceLevel, level]);
                                } else {
                                  setExperienceLevel(experienceLevel.filter(l => l !== level));
                                }
                              }}
                            />
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
                  <select
                    className="border rounded-lg px-4 py-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="deadline">Deadline Approaching</option>
                  </select>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-1/3" />
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-full" />
                              <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs?.map((job) => (
                      <Card key={job.id} className="bg-white hover:shadow-lg transition-shadow dark:bg-gray-800 border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2">
                              {job.company_logo ? (
                                <img
                                  src={job.company_logo}
                                  alt={job.company_name || 'Company Logo'}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Building className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white mb-1">
                                    {job.job_title}
                                  </h3>
                                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                                    {job.company_name || job.profiles?.company_name || 'Company Name Not Available'}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Posted by: {job.profiles?.full_name || 'Anonymous Recruiter'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                                    {job.salary_range}
                                  </div>
                                  <Button
                                    onClick={() => handleApply(job.id)}
                                    disabled={isApplying === job.id || !user || appliedJobs.includes(job.id)}
                                    className={`${
                                      appliedJobs.includes(job.id)
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white min-w-[120px]`}
                                  >
                                    {!user ? (
                                      'Login to Apply'
                                    ) : appliedJobs.includes(job.id)
                                      ? '✓ Applied'
                                      : isApplying === job.id
                                      ? 'Applying...'
                                      : 'Apply Now'}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mt-3 mb-4 line-clamp-2">
                                {job.job_description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                  <MapPin className="w-4 h-4" /> {job.job_location}
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                  <Clock className="w-4 h-4" /> {job.job_type}
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                  <Calendar className="w-4 h-4" /> 
                                  Deadline: {format(new Date(job.application_deadline), 'MMM dd, yyyy')}
                                </span>
                              </div>

                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredJobs?.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">No jobs found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <JobList filteredJobs={paginatedJobs} handleApply={handleApply} isApplying={isApplying} user={user} appliedJobs={appliedJobs} />
      <div className="pagination flex justify-center items-center space-x-4 mt-4">
        <Button onClick={handlePreviousPage} disabled={currentPage === 1} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2">
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>
        <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2">
          Next <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default JobsPost;