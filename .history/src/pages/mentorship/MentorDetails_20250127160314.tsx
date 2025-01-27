import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from 'lucide-react';
import { Mentor } from '@/types/mentorship';

export function MentorList() {
  const navigate = useNavigate();

  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mentor_profiles').select('*');
      if (error) throw error;
      return data as Mentor[];
    }
  });

  const handleCardClick = (mentorId: string) => {
    navigate(`/mentor-details/${mentorId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mentors?.map((mentor) => (
          <Card key={mentor.id} onClick={() => handleCardClick(mentor.id)}>
            <CardHeader className="flex flex-row items-center space-x-4">
              <img
                src={mentor.profile_image_url || '/placeholder.svg'}
                alt={mentor.name || 'Mentor'}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <CardTitle className="text-2xl">{mentor.name}</CardTitle>
                <div className="flex items-center text-yellow-500 mt-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-lg">{mentor.rating.toFixed(1)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{mentor.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MentorList;
