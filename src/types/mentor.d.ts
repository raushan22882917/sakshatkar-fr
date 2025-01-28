export interface Mentor {
  id: string;
  name: string;
  profile: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  company: string;
  expertise: string[];
  experience: number;
  rating: number;
  hourly_rate: number;
  bio: string;
  availability: string[];
}