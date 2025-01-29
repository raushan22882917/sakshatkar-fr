import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Contest } from '@/types/contest';

export default function ContestRegister() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState<Contest | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!contestId) {
      navigate('/contests');
      return;
    }
    fetchContestDetails();
  }, [contestId]);

  const fetchContestDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coding_contests')
        .select(`
          id,
          title,
          description,
          start_time,
          end_time,
          participant_count,
          status
        `)
        .eq('id', contestId)
        .single();

      if (error) throw error;
      
      setContest({
        ...data,
        total_participants: data.participant_count || 0,
        problems: []
      });
    } catch (error) {
      console.error('Error fetching contest:', error);
      toast({
        title: "Error",
        description: "Failed to load contest details",
        variant: "destructive"
      });
      navigate('/contests');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!contestId || !contest) return;
    
    setRegistering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to register for contests",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: contestId,
          user_id: user.id,
          score: 0,
          solved_problems: 0,
          rank: 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully registered for the contest",
      });
      navigate(`/contest/${contestId}`);
    } catch (error) {
      console.error('Error registering:', error);
      toast({
        title: "Error",
        description: "Failed to register for the contest",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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

          <div className="pt-6">
            <Button
              onClick={handleRegister}
              disabled={registering}
              className={`w-full h-12 text-lg transition-all duration-300 ${
                registering 
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {registering ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader type="spinner" size="small" />
                  <span>Registering...</span>
                </div>
              ) : (
                'Register for Contest'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}