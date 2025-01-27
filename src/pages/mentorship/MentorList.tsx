import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from "@/components/Navbar";
import { Search, Star, Users, Clock, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Mentor } from '@/types/mentorship';

const MentorList = () => {
  const navigate = useNavigate();
  
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mentors').select('*');
      if (error) throw new Error(error.message);
      return data as Mentor[];
    }
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Find Your Perfect Mentor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors?.map((mentor) => (
          <Card key={mentor.id} className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              {mentor.profile_image_url ? (
                <img 
                  src={mentor.profile_image_url} 
                  alt={`${mentor.profiles?.name || 'Mentor'}'s profile`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold">{mentor.profiles?.name || 'Anonymous Mentor'}</h2>
                <p className="text-sm text-gray-600">{mentor.company || 'Independent'}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{mentor.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{mentor.availability}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.map((exp, index) => (
                <Badge key={index} variant="secondary">{exp}</Badge>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button onClick={() => navigate(`/mentorship/${mentor.id}`)}>View Profile</Button>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{mentor.rating.toFixed(1)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentorList;