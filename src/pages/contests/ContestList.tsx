import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/use-toast";
import type { Contest } from "@/types/contest";

export default function ContestList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

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
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContests(data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
      toast({
        title: "Error",
        description: "Failed to load contests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Coding Contests</h1>
        <Button onClick={() => navigate('/contests/create')}>Create Contest</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => (
          <Card key={contest.id} className="p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{contest.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{contest.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Start:</span>
                <span className="text-sm">
                  {new Date(contest.start_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">End:</span>
                <span className="text-sm">
                  {new Date(contest.end_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status:</span>
                <Badge variant={contest.status === 'ONGOING' ? 'default' : 'secondary'}>
                  {contest.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Participants:</span>
                <span className="text-sm">{contest.participant_count}</span>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => navigate(`/contest/${contest.id}`)}
            >
              View Details
            </Button>
          </Card>
        ))}

        {contests.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No contests available</p>
          </div>
        )}
      </div>
    </div>
  );
}