import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Contest, ContestProblem } from "@/types/contest";
import { AiOutlineClockCircle, AiOutlineTeam, AiOutlineTrophy } from "react-icons/ai";
import { ContestLeaderboard } from "./components/ContestLeaderboard";

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [problemAttempts, setProblemAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchContestDetails();
    checkParticipation();
    fetchProblemAttempts();
  }, [id]);

  const fetchContestDetails = async () => {
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
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "Error",
          description: "Contest not found",
          variant: "destructive",
        });
        return;
      }

      const transformedContest = {
        ...data,
        problems: data.coding_problems,
        total_participants: data.participant_count,
      };

      setContest(transformedContest);
    } catch (error) {
      console.error("Error fetching contest details:", error);
      toast({
        title: "Error",
        description: "Failed to load contest details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemAttempts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: submissions, error } = await supabase
        .from("contest_submissions")
        .select("problem_id, count")
        .eq("contest_id", id)
        .eq("user_id", user.id)
        .select("problem_id");

      if (error) throw error;

      const attempts: Record<string, number> = {};
      submissions?.forEach(sub => {
        attempts[sub.problem_id] = (attempts[sub.problem_id] || 0) + 1;
      });
      setProblemAttempts(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  };

  const checkParticipation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contest_participants")
        .select("id")
        .eq("contest_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setIsParticipant(!!data);
    } catch (error) {
      console.error("Error checking participation:", error);
    }
  };

  const handleSolveProblem = (problemId: string) => {
    if (!contest) return;
    
    const attempts = problemAttempts[problemId] || 0;
    if (attempts >= 2) {
      toast({
        title: "Attempt limit reached",
        description: "You can only attempt each problem twice during the contest.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/contests/${id}/problem/${problemId}`);
  };

  const isContestActive = contest && 
    new Date() >= new Date(contest.start_time) && 
    new Date() <= new Date(contest.end_time);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contest) {
    return <div className="text-center py-12">Contest not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="p-8 bg-gray-800/50 mb-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{contest.title}</h1>
              <Badge variant="outline">{contest.status}</Badge>
            </div>
            <p className="text-gray-300 mb-6">{contest.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <AiOutlineClockCircle className="text-blue-400" />
                <span>Duration: {
                  Math.round(
                    (new Date(contest.end_time).getTime() - 
                     new Date(contest.start_time).getTime()) / 
                    (1000 * 60 * 60)
                  )
                } hours</span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineTeam className="text-purple-400" />
                <span>{contest.participant_count} Participants</span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineTrophy className="text-yellow-400" />
                <span>{contest.coding_problems?.length || 0} Problems</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Problems</h2>
            <div className="space-y-4">
              {contest.coding_problems?.map((problem) => (
                <Card 
                  key={problem.id}
                  className="p-4 bg-gray-700/50 hover:bg-gray-700/70 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{problem.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>{problem.points} points</span>
                        <span>{problem.solved_count} solved</span>
                        {problemAttempts[problem.id] > 0 && (
                          <span>Your attempts: {problemAttempts[problem.id]}/2</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge>{problem.difficulty}</Badge>
                      {isContestActive && (
                        <Button
                          onClick={() => handleSolveProblem(problem.id)}
                          disabled={problemAttempts[problem.id] >= 2}
                          variant={problemAttempts[problem.id] >= 2 ? "secondary" : "default"}
                        >
                          {problemAttempts[problem.id] >= 2 ? "Max attempts" : "Solve"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {isContestActive && (
          <Card className="p-8 bg-gray-800/50">
            <h2 className="text-2xl font-bold mb-6">Live Leaderboard</h2>
            <ContestLeaderboard contestId={id!} />
          </Card>
        )}
      </div>
    </div>
  );
}