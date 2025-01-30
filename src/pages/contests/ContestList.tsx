import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Contest } from "@/types/contest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function ContestList() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
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
        `);

      if (error) throw error;

      if (data) {
        const formattedContests: Contest[] = data.map(contest => ({
          id: contest.id,
          title: contest.title,
          description: contest.description,
          start_time: contest.start_time,
          end_time: contest.end_time,
          status: contest.status?.toLowerCase() as Contest['status'],
          total_participants: contest.participant_count || 0,
          participant_count: contest.participant_count || 0,
          problems: contest.coding_problems?.map(problem => ({
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
            points: problem.points,
            solved_count: problem.solved_count || 0,
            attempted_count: problem.attempted_count || 0,
            user_status: 'Not Attempted'
          })) || []
        }));

        setContests(formattedContests);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch contests. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContestClick = (contestId: string) => {
    navigate(`/contest/${contestId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading contests...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coding Contests</h1>
        <div className="space-x-4">
          <Button 
            variant="outline"
            onClick={() => navigate("/contests/live")}
          >
            Join Live Contest
          </Button>
          <Button onClick={() => navigate("/contest/create")}>Create Contest</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contests.map((contest) => (
          <Card 
            key={contest.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleContestClick(contest.id)}
          >
            <CardHeader>
              <CardTitle>{contest.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{contest.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {contest.status}
                </span>
                <span>{contest.total_participants} participants</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contests.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No contests available.</p>
        </div>
      )}
    </div>
  );
}
