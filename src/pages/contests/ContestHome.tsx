import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Contest } from "@/types/contest";
import { ContestCard } from "./components/ContestCard";
import { ContestCountdown } from "@/components/contests/ContestCountdown";
import { useAuth } from "@/contexts/AuthContext";

export default function ContestHome() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [participatedContests, setParticipatedContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchContests();
  }, [user]);

  const fetchContests = async () => {
    try {
      const { data: allContests, error } = await supabase
        .from("coding_contests")
        .select(`
          *,
          coding_problems (
            id,
            title,
            difficulty,
            points,
            solved_count,
            attempted_count
          )
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;

      const transformedContests = allContests.map(contest => ({
        ...contest,
        problems: contest.coding_problems,
        total_participants: contest.participant_count,
      }));

      setContests(transformedContests);

      // Fetch participated contests if user is logged in
      if (user) {
        const { data: participations, error: participationError } = await supabase
          .from("contest_participants")
          .select(`contest_id`)
          .eq("user_id", user.id);

        if (participationError) throw participationError;

        const participatedIds = participations?.map(p => p.contest_id) || [];
        const userContests = transformedContests.filter(c => 
          participatedIds.includes(c.id)
        );
        setParticipatedContests(userContests);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast({
        title: "Error",
        description: "Failed to load contests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ContestSection = ({ 
    title, 
    contests, 
    bgGradient 
  }: { 
    title: string; 
    contests: Contest[]; 
    bgGradient: string; 
  }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => (
          <div key={contest.id} className="flex flex-col gap-4">
            <ContestCard contest={contest} bgColor={bgGradient} />
            {new Date() < new Date(contest.start_time) && (
              <ContestCountdown 
                startTime={contest.start_time} 
                endTime={contest.end_time} 
              />
            )}
          </div>
        ))}
        {contests.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-4">
            No {title.toLowerCase()} contests available at the moment.
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const weeklyContests = contests.filter(c => c.title.toLowerCase().includes("weekly"));
  const biWeeklyContests = contests.filter(c => c.title.toLowerCase().includes("bi-weekly"));
  const monthlyContests = contests.filter(c => c.title.toLowerCase().includes("monthly"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Coding Contests
          </h1>
          <p className="text-gray-400 text-lg">
            Participate in contests and improve your coding skills
          </p>
        </div>

        {user && participatedContests.length > 0 && (
          <ContestSection 
            title="Your Contests" 
            contests={participatedContests} 
            bgGradient="from-green-600 to-green-800"
          />
        )}

        <ContestSection 
          title="Weekly Contests" 
          contests={weeklyContests} 
          bgGradient="from-blue-600 to-blue-800"
        />

        <ContestSection 
          title="Bi-Weekly Contests" 
          contests={biWeeklyContests} 
          bgGradient="from-indigo-600 to-indigo-800"
        />

        <ContestSection 
          title="Monthly Contests" 
          contests={monthlyContests} 
          bgGradient="from-purple-600 to-purple-800"
        />
      </div>
    </div>
  );
}