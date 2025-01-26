import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/jobs";

export const getJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase
    .from('job_posts')
    .select(`
      *,
      profiles:recruiter_id (
        name,
        profile_image_url,
        company_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
  return data;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  const { error } = await supabase
    .from('job_posts')
    .delete()
    .eq('id', jobId);

  if (error) throw error;
};