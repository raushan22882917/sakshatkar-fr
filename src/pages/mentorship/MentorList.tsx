import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mentor } from '@/types/mentorship';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Star, Users, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function MentorList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            company_name
          )
        `);
      
      if (error) throw error;
      return data as Mentor[];
    }
  });

  const filteredMentors = mentors?.filter(mentor => 
    mentor.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Find Your Perfect Mentor
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Connect with industry experts who can guide you through your tech journey
        </p>
      </div>

      <div className="relative mb-8 max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name or expertise..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          filteredMentors?.map((mentor) => (
            <Card 
              key={mentor.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/mentorship/${mentor.id}`)}
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <img
                  src={mentor.profile_image_url || '/placeholder.svg'}
                  alt={mentor.profiles?.name || 'Mentor'}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-lg">{mentor.profiles?.name}</CardTitle>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1">{mentor.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {mentor.bio.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{mentor.total_sessions} sessions</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>${mentor.hourly_rate}/hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default MentorList;