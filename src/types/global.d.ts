export interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number;
  details?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags?: string[];
  constraints?: string;
  input_format?: string;
  output_format?: string;
  test_cases: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  company: string;
  expertise: string[];
  hourly_rate: number;
  bio: string;
  profile_image_url?: string;
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