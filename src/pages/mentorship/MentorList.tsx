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
  
  const { data: mentors, isLoading } = useQuery<Mentor[]>('mentors', async () => {
    const { data, error } = await supabase.from('mentors').select('*');
    if (error) throw new Error(error.message);
    return data;
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
      <h1 className="text-2xl font-bold mb-4">Mentors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors?.map((mentor) => (
          <Card key={mentor.id} className="p-4">
            <h2 className="text-lg font-semibold">{mentor.name}</h2>
            <p className="text-sm text-gray-600">{mentor.expertise}</p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => navigate(`/mentors/${mentor.id}`)}>View Profile</Button>
              <Badge>{mentor.rating} <Star className="inline h-4 w-4" /></Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentorList;
