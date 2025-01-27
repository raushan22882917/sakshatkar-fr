export interface Mentor {
  id: string;
  user_id: string;
  expertise: string[];
  hourly_rate: number;
  availability: string;
  bio: string;
  rating: number;
  total_sessions: number;
  profile_image_url: string;
  skills: string[];
  mentoring_goals: string[];
  company: string;
  experience: number;
  one_on_one_price: number;
  group_price: number;
  max_group_size: number;
  payment_options: string[];
  profiles?: {
    name: string;
    email: string;
  };
}