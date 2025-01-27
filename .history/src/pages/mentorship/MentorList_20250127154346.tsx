import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from "@/components/Navbar";
import { Search, Star, Users, Clock, Target, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import React from "react";

export function MentorList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

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
      return data;
    },
  });

  const filteredMentors = mentors?.filter(
    (mentor) =>
      mentor.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="containers">
      <Navbar />

      {showWelcome ? (
        <div className="text-center mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Why You Need A Mentor</h1>
          <p className="text-lg mb-4">
            Mentorship is the key to success in any career. By becoming a mentor, you can provide valuable insights,
            support, and guidance to your mentee, helping them achieve their goals and grow as a developer.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="border rounded-lg shadow-lg p-4">
              <Search className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Gain Knowledge</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from the experiences and insights of those who have walked the path before you.
              </p>
            </div>
            <div className="border rounded-lg shadow-lg p-4">
              <Users className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Build Connections</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Expand your network and open doors to new opportunities through mentorship.
              </p>
            </div>
            <div className="border rounded-lg shadow-lg p-4">
              <Clock className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Achieve Goals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set and reach your personal and professional goals with the guidance of a mentor.
              </p>
            </div>
          </div>
          
          <Button className="mt-8" onClick={() => setShowWelcome(false)}>
            Explore Mentors
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Connect with industry experts who can guide you through your tech journey.
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
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                    />
                    <div>
                      <CardTitle className="text-lg">{mentor.profiles?.name}</CardTitle>
                      <div className="text-sm text-gray-500">{mentor.company}</div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1">{mentor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorList;
