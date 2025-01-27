import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Search, Star, Users, Clock, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MentorList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch mentors from Supabase
  const { data: mentors, isLoading } = useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select(
          `
          id,
          user_id,
          expertise,
          hourly_rate,
          bio,
          rating,
          total_sessions,
          created_at,
          profile_image_url,
          skills,
          company,
          experience,
          one_on_one_price,
          group_price,
          max_group_size,
          payment_options,
          Linkedin_ul
        `
        );

      if (error) throw error;
      return data;
    },
  });

  // Filter mentors based on search query
  const filteredMentors = mentors?.filter(
    (mentor) =>
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise?.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="containers">
      <Navbar />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Find Your Mentor
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Learn from top industry experts and enhance your career.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by skill, company, or expertise..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(6)
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
          : filteredMentors?.map((mentor) => (
              <Card
                key={mentor.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/mentorship/${mentor.id}`)}
              >
                <CardHeader className="flex flex-row items-center space-x-4">
                  <img
                    src={mentor.profile_image_url || "/placeholder.svg"}
                    alt={mentor.company || "Mentor"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {mentor.company || "Independent Mentor"}
                    </CardTitle>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{mentor.rating.toFixed(1) || "N/A"}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {mentor.bio?.substring(0, 120)}...
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise?.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{mentor.total_sessions || 0} sessions</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>${mentor.one_on_one_price || mentor.hourly_rate}/Months</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{mentor.company || "Freelancer"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}

export default MentorList;
