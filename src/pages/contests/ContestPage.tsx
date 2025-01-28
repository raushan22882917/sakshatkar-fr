import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AiOutlineClockCircle,
  AiOutlineTeam,
  AiOutlineTrophy,
  AiOutlineDollar,
  AiOutlineCalendar,
} from "react-icons/ai";
import type { Contest } from "@/types/contest";

type ContestFilter = "all" | "upcoming" | "ongoing" | "ended";

export default function ContestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeFilter, setActiveFilter] = useState<ContestFilter>("all");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_contests")
        .select(`
          *,
          contest_participants!inner (
            user_id,
            score,
            rank
          )
        `)
        .order("start_time", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const contestsWithStatus = data.map((contest) => {
        const startTime = new Date(contest.start_time);
        const endTime = new Date(contest.end_time);
        let status: "UPCOMING" | "ONGOING" | "ENDED";

        if (now < startTime) {
          status = "UPCOMING";
        } else if (now >= startTime && now <= endTime) {
          status = "ONGOING";
        } else {
          status = "ENDED";
        }

        const userParticipation = contest.contest_participants?.find(
          (p) => p.user_id === user?.id
        );

        return {
          ...contest,
          status,
          user_rank: userParticipation?.rank,
        };
      });

      setContests(contestsWithStatus);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const getTimeStatus = (contest: Contest) => {
    const now = new Date();
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);

    if (now < startTime) {
      const diff = startTime.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h`;
    } else if (now >= startTime && now <= endTime) {
      const diff = endTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } else {
      return "Ended";
    }
  };

  const filteredContests = contests.filter((contest) => {
    switch (activeFilter) {
      case "upcoming":
        return contest.status === "UPCOMING";
      case "ongoing":
        return contest.status === "ONGOING";
      case "ended":
        return contest.status === "ENDED";
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Coding Contest Platform
          </h1>
          <p className="text-gray-400 text-lg">
            Join the competition and showcase your skills!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredContests.map((contest) => (
            <Card
              key={contest.id}
              className="bg-[#1e293b] border-none hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/contest/${contest.id}`)}
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                      {contest.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {contest.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      contest.status === "ONGOING"
                        ? "default"
                        : contest.status === "UPCOMING"
                        ? "secondary"
                        : "outline"
                    }
                    className="ml-2"
                  >
                    {contest.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AiOutlineCalendar className="h-4 w-4" />
                    <span>
                      {new Date(contest.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AiOutlineDollar className="h-4 w-4" />
                    <span>Prize Pool: $500</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AiOutlineClockCircle className="h-4 w-4" />
                    <span>{getTimeStatus(contest)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AiOutlineTeam className="h-4 w-4" />
                    <span>{contest.total_participants} participants</span>
                  </div>
                </div>

                {contest.user_rank && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400 mt-2">
                    <AiOutlineTrophy className="h-4 w-4" />
                    Your Rank: #{contest.user_rank}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => navigate("/contest/register")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Join Now
          </Button>
          <p className="text-gray-400 mt-4">Sign up now to start competing!</p>
        </div>

        {filteredContests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No {activeFilter === "all" ? "" : activeFilter} contests found
          </div>
        )}
      </div>
    </div>
  );
}