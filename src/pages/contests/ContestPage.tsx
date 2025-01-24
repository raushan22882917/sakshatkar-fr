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
      return `Starts in ${days}d ${hours}h`;
    } else if (now >= startTime && now <= endTime) {
      const diff = endTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Ends in ${hours}h ${minutes}m`;
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
    <div className="container py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Coding Contests</h1>
        {user && (
          <Button onClick={() => navigate("/contest/create")} className="gap-2">
            Create Contest
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setActiveFilter("all")}>
            All Contests
          </TabsTrigger>
          <TabsTrigger value="upcoming" onClick={() => setActiveFilter("upcoming")}>
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="ongoing" onClick={() => setActiveFilter("ongoing")}>
            Ongoing
          </TabsTrigger>
          <TabsTrigger value="ended" onClick={() => setActiveFilter("ended")}>
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          {filteredContests.map((contest) => (
            <Card
              key={contest.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/contest/${contest.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{contest.title}</h2>
                  <p className="text-muted-foreground mt-1">{contest.description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <AiOutlineClockCircle className="h-4 w-4" />
                      {getTimeStatus(contest)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AiOutlineTeam className="h-4 w-4" />
                      {contest.participant_count} participants
                    </div>
                    {contest.user_rank && (
                      <div className="flex items-center gap-2 text-sm">
                        <AiOutlineTrophy className="h-4 w-4" />
                        Rank: #{contest.user_rank}
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    contest.status === "ONGOING"
                      ? "default"
                      : contest.status === "UPCOMING"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {contest.status}
                </Badge>
              </div>
            </Card>
          ))}

          {filteredContests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No {activeFilter === "all" ? "" : activeFilter} contests found
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
