import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mentor } from '@/types/mentorship';
import { WelcomeSection } from '@/components/mentorship/WelcomeSection';
import { MentorSearch } from '@/components/mentorship/MentorSearch';
import { MentorCard } from '@/components/mentorship/MentorCard';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MentorList() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `);

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      mentor.profiles?.name?.toLowerCase().includes(searchLower) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(searchLower)) ||
      mentor.skills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="container py-8">
        <WelcomeSection />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <WelcomeSection />
      <MentorSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="grid gap-6 md:grid-cols-2">
        {filteredMentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
        {filteredMentors.length === 0 && (
          <p className="text-center col-span-2 text-gray-500">
            No mentors found matching your search criteria.
          </p>
        )}
      </div>
    </div>
  );
}

export default MentorList;