import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Contest } from "@/types/contest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LiveContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLiveContests();
  }, []);

  const fetchLiveContests = async () => {
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
        .eq('status', 'ONGOING');

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
        description: "Failed to fetch live contests. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartContest = (contest: Contest) => {
    setSelectedContest(contest);
    setShowEmailDialog(true);
  };

  const verifyAndJoinContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      // Check if email exists in profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "Error",
          description: "Email not found. Please sign up first.",
          variant: "destructive"
        });
        return;
      }

      // Register participation
      if (selectedContest) {
        const { error: participationError } = await supabase
          .from('contest_participants')
          .insert([
            {
              contest_id: selectedContest.id,
              user_id: profiles.id,
            }
          ]);

        if (participationError) throw participationError;

        toast({
          title: "Success",
          description: "You've successfully joined the contest!",
        });

        // Navigate to contest page
        navigate(`/contest/${selectedContest.id}/problem/${selectedContest.problems[0]?.id}`);
      }
    } catch (error) {
      console.error("Error joining contest:", error);
      toast({
        title: "Error",
        description: "Failed to join contest. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
      setShowEmailDialog(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading live contests...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Contests</h1>
        <p className="text-gray-600 mt-2">Join ongoing coding contests and showcase your skills!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contests.map((contest) => (
          <Card key={contest.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{contest.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{contest.description}</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 font-medium">Live Now</span>
                  <span>{contest.total_participants} participants</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleStartContest(contest)}
                >
                  Start Contest
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contests.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No live contests available at the moment.</p>
        </div>
      )}

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Contest</DialogTitle>
            <DialogDescription>
              Please enter your email to verify and join the contest.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={verifyAndJoinContest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={verifying}>
              {verifying ? "Verifying..." : "Join Contest"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}