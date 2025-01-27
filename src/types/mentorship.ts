export interface Mentor {
  id: string;
  user_id: string;
  expertise: string[];
  hourly_rate: number;
  availability: string;
  bio: string;
  rating: number;
  total_sessions: number;
  created_at: string;
  profile_image_url: string | null;
  skills: string[];
  mentoring_goals: string[];
  company: string;
  experience: number;
  one_on_one_price: number;
  group_price: number;
  max_group_size: number;
  payment_options: string[];
  profile?: {
    name: string;
    email: string;
    company_name: string;
  };
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  expectedOutput: string;
  explanation?: string;
  passed?: boolean;
}