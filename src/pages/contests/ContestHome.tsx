import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AiOutlineCode,
  AiOutlineTrophy,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineHistory,
  AiOutlineStar,
} from "react-icons/ai";
import type { Contest } from "@/types/contest";

export default function ContestHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_contests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Active Contests",
      description: "View and participate in ongoing contests",
      icon: <AiOutlineCode className="h-8 w-8" />,
      action: () => navigate("/contest/list"),
    },
    {
      title: "Practice Problems",
      description: "Solve problems from past contests",
      icon: <AiOutlineHistory className="h-8 w-8" />,
      action: () => navigate("/contest/practice"),
    },
    {
      title: "Leaderboard",
      description: "Check global rankings and your position",
      icon: <AiOutlineTrophy className="h-8 w-8" />,
      action: () => navigate("/contest/leaderboard"),
    },
    {
      title: "Create Contest",
      description: "Host your own coding contest",
      icon: <AiOutlineStar className="h-8 w-8" />,
      action: () => navigate("/contest/create"),
      requiresAuth: true,
    },
  ];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Coding Contests
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Compete, learn, and improve your coding skills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) =>
          feature.requiresAuth && !user ? null : (
            <Card
              key={feature.title}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={feature.action}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          )
        )}
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recent Contests</h2>
            <Button variant="outline" onClick={() => navigate("/contest/list")}>
              View All
            </Button>
          </div>
          <div className="grid gap-4">
            {loading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </Card>
              ))
            ) : contests.length > 0 ? (
              contests.map((contest) => (
                <Card
                  key={contest.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/contest/${contest.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{contest.title}</h3>
                      <p className="text-muted-foreground mt-1">
                        {contest.description}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant="secondary">
                          {new Date(contest.start_time) > new Date()
                            ? "Upcoming"
                            : new Date(contest.end_time) > new Date()
                            ? "Ongoing"
                            : "Ended"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(contest.start_time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">
                  No contests available
                </p>
              </Card>
            )}
          </div>
        </section>

        {user && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Your Progress</h2>
              <Button
                variant="outline"
                onClick={() => navigate("/contest/leaderboard")}
              >
                View Leaderboard
              </Button>
            </div>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Contests Joined</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Problems Solved</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
