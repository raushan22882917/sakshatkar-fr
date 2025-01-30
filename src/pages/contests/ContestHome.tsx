import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Contest } from "@/types/contest";
import { ContestTypeSection } from "./components/ContestTypeSection";
import { UpcomingContests } from "./components/UpcomingContests";

export default function ContestHome() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
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
      setContests(data || []);
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

  const contestTypes = [
    {
      title: "Weekly Contest",
      schedule: "Every Monday",
      bgColor: "from-blue-600 to-blue-800",
      contests: contests.filter(c => c.title.toLowerCase().includes("weekly")),
    },
    {
      title: "Bi-Weekly Contest",
      schedule: "Every Other Wednesday",
      bgColor: "from-indigo-600 to-indigo-800",
      contests: contests.filter(c => c.title.toLowerCase().includes("bi-weekly")),
    },
    {
      title: "Monthly Contest",
      schedule: "First Saturday",
      bgColor: "from-purple-600 to-purple-800",
      contests: contests.filter(c => c.title.toLowerCase().includes("monthly")),
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
  }

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {contestTypes.map((type, index) => (
            <ContestTypeSection key={index} {...type} />
          ))}
        </div>

        <UpcomingContests contests={contests} />
      </div>
    </div>
  );
}