import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LeaderboardEntry = {
  user_id: string;
  username: string;
  total_score: number;
  contests_participated: number;
  rank: number;
};

export default function ContestLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("contest_participants")
        .select(`
          user_id,
          users (username),
          score,
          rank
        `)
        .order("rank", { ascending: true })
        .limit(50);

      if (error) throw error;

      const processedData = data.map((entry) => ({
        user_id: entry.user_id,
        username: entry.users?.username || "Anonymous",
        total_score: entry.score || 0,
        contests_participated: 1, // This would need to be calculated
        rank: entry.rank || 999,
      }));

      setLeaderboard(processedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Contest Leaderboard</h1>

      <Card className="p-6">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Total Score</TableHead>
                <TableHead>Contests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.user_id}>
                  <TableCell className="font-medium">#{entry.rank}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell>{entry.total_score}</TableCell>
                  <TableCell>{entry.contests_participated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
