import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Contest } from '@/types/contest';

export default function ContestRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contest, setContest] = useState<Contest | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContestDetails();
    checkRegistrationStatus();
  }, []);

  useEffect(() => {
    if (contest) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(contest.start_time).getTime();
        const distance = start - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft('Contest has started');
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [contest]);

  const fetchContestDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_contests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setContest(data);
    } catch (error) {
      console.error('Error fetching contest:', error);
      toast({
        title: "Error",
        description: "Failed to load contest details",
        variant: "destructive"
      });
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      const { data, error } = await supabase
        .from('contest_participants')
        .select('*')
        .eq('contest_id', id)
        .eq('user_id', session.session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleJoin = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Error",
          description: "Please login to register for the contest",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: id,
          user_id: session.session.user.id
        });

      if (error) throw error;

      setIsRegistered(true);
      toast({
        title: "Success",
        description: "Successfully registered for the contest"
      });
    } catch (error) {
      console.error('Error joining contest:', error);
      toast({
        title: "Error",
        description: "Failed to register for the contest",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    navigate(`/contest/${id}/problems`);
  };

  if (!contest) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 space-y-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {contest.title}
        </h1>
        
        <div className="space-y-4">
          <div className="text-2xl font-semibold text-blue-400">
            Time until contest starts: {timeLeft}
          </div>

          <div className="prose prose-invert">
            <h2 className="text-xl font-semibold text-purple-400">Instructions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Read all problems carefully before starting</li>
              <li>Each problem has its own scoring criteria</li>
              <li>You can submit multiple times for each problem</li>
              <li>Your highest score for each problem will be considered</li>
              <li>Time limit and memory constraints are strictly enforced</li>
              <li>Use of external libraries may be restricted</li>
            </ul>
          </div>

          <div className="pt-4">
            {!isRegistered ? (
              <Button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? 'Registering...' : 'Join Contest'}
              </Button>
            ) : new Date(contest.start_time) <= new Date() ? (
              <Button
                onClick={handleStart}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Contest
              </Button>
            ) : (
              <Button
                disabled
                className="w-full bg-green-600 opacity-50"
              >
                Registered - Waiting for contest to start
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}