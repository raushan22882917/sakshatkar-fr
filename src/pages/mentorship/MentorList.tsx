import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from "@/components/Navbar";
import { Search, Star, Users, Clock,Target, Lightbulb } from 'lucide-react'; // Only lucide-react icons
import { Skeleton } from '@/components/ui/skeleton';

export function MentorList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcome, setShowWelcome] = useState(true); // State for Welcome Page

  // Fetch mentors from Supabase
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          id,
          profile_image_url,
          bio,
          rating,
          hourly_rate,
          total_sessions,
          expertise,
          profiles:user_id (
            name,
            email
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  // Filter mentors based on the search query
  const filteredMentors = mentors?.filter(
    (mentor) =>
      mentor.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="containers ">
      <Navbar />

      {showWelcome ? (
        <div className="text-center mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Why You Need To Mentor</h1>
          <p className="text-lg mb-4">Mentorship is the key to success in any career. By becoming a mentor, you can provide valuable insights, support, and guidance to your mentee, helping them achieve their goals and grow as a developer.</p>
          {/* Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {/* Card 1 */}
            <div className="border rounded-lg shadow-lg p-4">
              <Search className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Gain Knowledge</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from the experiences and insights of those who have walked the path before you.
              </p>
            </div>
            {/* Card 2 */}
            <div className="border rounded-lg shadow-lg p-4">
              <Users className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Build Connections</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Expand your network and open doors to new opportunities through mentorship.
              </p>
            </div>
            {/* Card 3 */}
            <div className="border rounded-lg shadow-lg p-4">
              <Clock className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Achieve Goals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set and reach your personal and professional goals with the guidance of a mentor.
              </p>
            </div>
            {/* Card 4 */}
            <div className="border rounded-lg shadow-lg p-4">
              <Clock className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Receive Feedback</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get constructive feedback to improve your skills and performance.
              </p>
            </div>
            {/* Card 5 */}
            <div className="border rounded-lg shadow-lg p-4">
              <Clock className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Develop Skills</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enhance your skills and knowledge through tailored mentorship sessions.
              </p>
            </div>
            {/* Card 6 */}
            <div className="border rounded-lg shadow-lg p-4">
              <Clock className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Boost Confidence</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gain the confidence to take on new challenges and pursue your passions.
              </p>
            </div>
          </div>

          {/* Explore Mentors Button */}
          <Button className="mt-8" onClick={() => setShowWelcome(false)}>
            Explore Mentors
          </Button>

          {/* Why Choose Us Section */}
          <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start lg:justify-between gap-8 mt-12">
  <div className="text-left max-w-xl space-y-8 ">
    <div className="flex items-center gap-3 text-align:center">
      <Users className="w-8 h-8 text-blue-500" />
      <div>
        <h2 className="text-2xl font-bold mb-4 ">What We Offer</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Personalized mentorship programs, flexible schedules, and guidance to achieve your career goals.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Target className="w-8 h-8 text-green-500" />
      <div>
        <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We connect you with top industry experts to gain the skills and insights needed to succeed.
        </p>
      </div>
    </div>
  </div>
  <div className="flex-shrink-0">
    <img
      src="mentor.png"
      alt="Why Choose Us"
      className="w-full max-w-md rounded-lg shadow-md"
    />
  </div>
</div>
        </div>
      ) : (
        <div>
          {/* Mentor List */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Find Your Perfect Mentor
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Connect with industry experts who can guide you through your tech journey.
            </p>
          </div>

          <div className="mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Why You Need a Mentor</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <img src="/mentor-importance.jpg" alt="Importance of Mentorship" className="w-full h-48 object-cover rounded-lg mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Having a mentor can provide you with invaluable insights, guidance, and support as you navigate your career path. They can help you identify your strengths, set goals, and connect you with opportunities that align with your aspirations.
                </p>
              </CardContent>
            </Card>
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
              Array(6)
                .fill(0)
                .map((_, i) => (
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
      )}
    </div>
  );
}

export default MentorList;
