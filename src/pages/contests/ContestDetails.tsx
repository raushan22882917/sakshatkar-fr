import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/ui/loader";
import { Contest, ContestProblem, ContestParticipant } from "@/types/contest";
import {
  AiOutlineClockCircle,
  AiOutlineTeam,
  AiOutlineTrophy,
} from "react-icons/ai";

export default function ContestDetails() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contest, setContest] = useState<Contest | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!contestId) {
      toast({
        title: "Error",
        description: "Contest ID is required",
        variant: "destructive"
      });
      navigate('/contests');
      return;
    }
    fetchContestDetails();
    checkParticipation();
  }, [contestId]);

  const fetchContestDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_contests")
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          status,
          participant_count,
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

      if (error) throw error;

      const problems = data.coding_problems?.map(problem => ({
        ...problem,
        user_status: "Not Attempted" as const
      })) || [];

      setContest({
        ...data,
        problems,
        total_participants: data.participant_count || 0,
        coding_problems: problems
      });
    } catch (error) {
      console.error("Error fetching contest:", error);
      toast({
        title: "Error",
        description: "Failed to load contest details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkParticipation = async () => {
    if (!user || !contestId) return;

    try {
      const { data, error } = await supabase
        .from("contest_participants")
        .select("id")
        .eq("contest_id", contestId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setIsParticipating(!!data);
    } catch (error) {
      console.error("Error checking participation:", error);
    }
  };

  const handleParticipate = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to participate in contests",
        variant: "destructive"
      });
      return;
    }

    setJoining(true);
    try {
      const { error } = await supabase
        .from("contest_participants")
        .insert({
          contest_id: contestId,
          user_id: user.id,
          score: 0,
          solved_problems: 0,
          rank: 0
        });

      if (error) throw error;

      setIsParticipating(true);
      toast({
        title: "Success",
        description: "You've successfully joined the contest",
      });
    } catch (error) {
      console.error("Error joining contest:", error);
      toast({
        title: "Error",
        description: "Failed to join the contest",
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };

  const handleStartContest = () => {
    if (contest?.problems[0]) {
      navigate(`/contest/${contestId}/problem/${contest.problems[0].id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Contest not found</h2>
          <Button onClick={() => navigate('/contests')} className="mt-4">
            Back to Contests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 space-y-6 bg-gray-900 text-white">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {contest.title}
          </h1>
          
          <div className="text-lg text-gray-300">
            {contest.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400">Start Time</h3>
              <p className="text-gray-300">
                {new Date(contest.start_time).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400">End Time</h3>
              <p className="text-gray-300">
                {new Date(contest.end_time).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400">Status</h3>
              <Badge variant="outline" className="mt-1">
                {contest.status}
              </Badge>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mt-6">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Contest Rules</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>Read all problems carefully before starting</li>
              <li>Each problem has its own scoring criteria</li>
              <li>You can submit multiple times for each problem</li>
              <li>Your highest score for each problem will be considered</li>
              <li>Time limit and memory constraints are strictly enforced</li>
            </ul>
          </div>

          <div className="pt-6 flex gap-4">
            {!isParticipating ? (
              <Button
                onClick={handleParticipate}
                disabled={joining || contest.status === "ENDED"}
                className="w-full h-12 text-lg"
              >
                {joining ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader type="spinner" size="small" />
                    <span>Joining...</span>
                  </div>
                ) : (
                  'Participate in Contest'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleStartContest}
                disabled={contest.status !== "ONGOING"}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
              >
                Start Contest
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}