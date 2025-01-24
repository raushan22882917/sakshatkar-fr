import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  AiOutlineClockCircle,
  AiOutlineTeam,
  AiOutlineTrophy,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineUser,
} from "react-icons/ai";
import type { Contest, Problem, ContestParticipant } from "@/types/contest";

interface ContestProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  solved_count: number;
  attempted_count: number;
  user_status?: "Solved" | "Attempted" | null;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  problems: ContestProblem[];
  total_participants: number;
  user_rank?: number;
  user_score?: number;
}

interface Participant {
  user_id: string;
  name: string;
  score: number;
  solved_problems: number;
  rank: number;
}

export default function ContestDetails() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contest, setContest] = useState<Contest | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [participants, setParticipants] = useState<ContestParticipant[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (!contestId) return;
    fetchContestDetails();
    fetchParticipants();

    const timer = setInterval(() => {
      if (contest) {
        const now = new Date().getTime();
        const end = new Date(contest.end_time).getTime();
        const distance = end - now;

        if (distance < 0) {
          setTimeLeft("Contest Ended");
          clearInterval(timer);
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contestId, contest?.end_time]);

  const fetchContestDetails = async () => {
    try {
      const { data: contestData, error: contestError } = await supabase
        .from("coding_contests")
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          coding_problems (
            id,
            title,
            difficulty,
            points,
            solved_count,
            attempted_count
          )
        `)
        .eq("id", contestId)
        .single();

      if (contestError) throw contestError;

      if (user) {
        // Fetch user's progress for each problem
        const { data: userProgress } = await supabase
          .from("contest_submissions")
          .select("problem_id, status")
          .eq("contest_id", contestId)
          .eq("user_id", user.id);

        const problems = contestData.coding_problems.map((problem: ContestProblem) => ({
          ...problem,
          user_status: getUserProblemStatus(problem.id, userProgress || []),
        }));

        setContest({ ...contestData, problems });
      } else {
        setContest({ ...contestData, problems: contestData.coding_problems });
      }
    } catch (error) {
      console.error("Error fetching contest details:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("contest_participants")
        .select(`
          user_id,
          profiles (name),
          score,
          solved_problems
        `)
        .eq("contest_id", contestId)
        .order("score", { ascending: false });

      if (error) throw error;

      const participantsWithRank = data.map((p, index) => ({
        user_id: p.user_id,
        name: p.profiles.name,
        score: p.score,
        solved_problems: p.solved_problems,
        rank: index + 1,
      }));

      setParticipants(participantsWithRank);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const getUserProblemStatus = (problemId: string, userProgress: any[]) => {
    const submission = userProgress?.find((p) => p.problem_id === problemId);
    if (!submission) return null;
    return submission.status === "ACCEPTED" ? "Solved" : "Attempted";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  if (!contest) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Contest Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{contest.title}</h1>
          <p className="text-muted-foreground mt-2">{contest.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <AiOutlineClockCircle className="h-4 w-4" />
              {timeLeft}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AiOutlineTeam className="h-4 w-4" />
              {contest.total_participants} participants
            </div>
            {contest.user_rank && (
              <div className="flex items-center gap-2 text-sm">
                <AiOutlineTrophy className="h-4 w-4" />
                Rank: #{contest.user_rank}
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          variant="outline"
          className="gap-2"
        >
          <AiOutlineTrophy className="h-5 w-5" />
          {showLeaderboard ? "Show Problems" : "Show Leaderboard"}
        </Button>
      </div>

      {/* Problems List */}
      {!showLeaderboard ? (
        <div className="space-y-4">
          {contest.problems?.map((problem) => (
            <Card
              key={problem.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/contest/${contestId}/problem/${problem.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {problem.user_status === "Solved" ? (
                      <AiOutlineCheck className="h-5 w-5 text-green-500" />
                    ) : problem.user_status === "Attempted" ? (
                      <AiOutlineClose className="h-5 w-5 text-red-500" />
                    ) : null}
                  </div>
                  <div>
                    <h3 className="font-medium">{problem.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {problem.points} points
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {((problem.solved_count / (problem.attempted_count || 1)) * 100).toFixed(1)}% success
                  rate
                </div>
              </div>
              <Progress
                value={(problem.solved_count / (problem.attempted_count || 1)) * 100}
                className="h-1 mt-4"
              />
            </Card>
          ))}
        </div>
      ) : (
        // Leaderboard
        <div className="space-y-4">
          {participants.map((participant) => (
            <Card
              key={participant.user_id}
              className={`p-4 ${
                participant.user_id === user?.id ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center font-medium">#{participant.rank}</div>
                  <div className="flex items-center gap-2">
                    <AiOutlineUser className="h-5 w-5" />
                    <span>{participant.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-sm">
                    <span className="font-medium">{participant.solved_problems}</span> solved
                  </div>
                  <div className="w-20 text-right font-medium">{participant.score} points</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
