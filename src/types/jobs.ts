export interface Job {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range?: string;
  requirements?: string[];
  created_at: string;
}