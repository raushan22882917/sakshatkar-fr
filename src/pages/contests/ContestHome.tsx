import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  AiOutlineClockCircle,
  AiOutlineTeam,
  AiOutlineTrophy,
  AiOutlineCalendar,
} from "react-icons/ai";
import type { Contest } from "@/types/contest";

export default function ContestHome() {
  const navigate = useNavigate();
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

  const getTimeRemaining = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `Starts in ${days} days`;
    } else if (now >= start && now <= end) {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} hours remaining`;
    }
    return "Ended";
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
            <Card
              key={index}
              className={`p-6 bg-gradient-to-br ${type.bgColor} border-0 hover:scale-105 transition-transform duration-300 text-white`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{type.title}</h3>
                  <Badge variant="secondary" className="bg-white/10">
                    {type.contests.length} Active
                  </Badge>
                </div>
                <div className="space-y-3 mb-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <AiOutlineCalendar className="text-white/80" />
                    <span>{type.schedule}</span>
                  </div>
                  {type.contests.map((contest) => (
                    <div
                      key={contest.id}
                      className="bg-black/20 p-3 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                      onClick={() => navigate(`/contests/${contest.id}`)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{contest.title}</span>
                        <Badge variant="outline">
                          {contest.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AiOutlineClockCircle className="text-white/80" />
                        <span>
                          {getTimeRemaining(contest.start_time, contest.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <AiOutlineTeam className="text-white/80" />
                        <span>{contest.participant_count} participants</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upcoming Contests Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Upcoming Contests</h2>
          <div className="grid gap-6">
            {contests
              .filter(contest => new Date(contest.start_time) > new Date())
              .map((contest) => (
                <Card
                  key={contest.id}
                  className="p-6 bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                  onClick={() => navigate(`/contests/${contest.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{contest.title}</h3>
                      <p className="text-gray-400">{contest.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="mb-2">
                        {getTimeRemaining(contest.start_time, contest.end_time)}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm">
                        <AiOutlineTrophy className="text-yellow-500" />
                        <span>{contest.coding_problems?.length || 0} problems</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}