export interface Job {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  salary_range?: string;
  created_at: string;
  recruiter_id: string;
  profiles?: {
    name: string;
    profile_image_url: string;
    company_name: string;
  };
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    resume_url: string;
    profile_image: string;
  };
  job_post: {
    job_title: string;
    company_name: string;
  };
}