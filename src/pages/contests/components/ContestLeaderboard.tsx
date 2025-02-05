import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContestParticipant } from "@/types/contest";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface ContestLeaderboardProps {
  contestId: string;
}

export function ContestLeaderboard({ contestId }: ContestLeaderboardProps) {
  const [participants, setParticipants] = useState<ContestParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("contest_participants")
        .select(`
          *,
          profile:profile_id (
            name,
            avatar_url
          )
        `)
        .eq("contest_id", contestId)
        .order("score", { ascending: false })
        .order("solved_problems", { ascending: false });

      if (error) throw error;

      const transformedData = data.map((participant: any) => ({
        ...participant,
        name: participant.profile?.name || "Anonymous",
        avatar_url: participant.profile?.avatar_url
      }));

      setParticipants(transformedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {participants.map((participant, index) => (
        <Card key={participant.id} className="p-4 bg-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-8 text-center font-bold">
              {index + 1}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={participant.avatar_url} />
              <AvatarFallback>
                {participant.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{participant.name}</div>
              <div className="text-sm text-gray-400">
                Solved: {participant.solved_problems} | Score: {participant.score}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No participants yet
        </div>
      )}
    </div>
  );
}