import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Contest } from '@/types/contest';
import { Loader } from '@/components/ui/loader';

export default function ContestRegister() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contest, setContest] = useState<Contest | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      setError("Invalid contest ID");
      toast({
        title: "Error",
        description: "Invalid contest ID",
        variant: "destructive"
      });
      navigate('/contests');
      return;
    }
    
    const initializeData = async () => {
      try {
        setPageLoading(true);
        await checkUserSession();
        await fetchContestDetails();
        await checkRegistrationStatus();
      } catch (err) {
        console.error('Initialization error:', err);
        setError("Failed to load contest data");
      } finally {
        setPageLoading(false);
      }
    };

    initializeData();
  }, [id]);

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

  const checkUserSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        setError("Please login to continue");
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setUserData(profileData);
    } catch (err) {
      console.error('Session check error:', err);
      throw err;
    }
  };

  const fetchContestDetails = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('coding_contests')
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
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setError("Contest not found");
        toast({
          title: "Error",
          description: "Contest not found",
          variant: "destructive"
        });
        navigate('/contests');
        return;
      }

      setContest(data);
    } catch (error: any) {
      console.error('Error fetching contest:', error);
      throw new Error(error.message || "Failed to load contest details");
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      if (!id) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('contest_participants')
        .select('*')
        .eq('contest_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setIsRegistered(!!data);
    } catch (error: any) {
      console.error('Error checking registration:', error);
      throw new Error(error.message || "Failed to check registration status");
    }
  };

  const handleJoin = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please login to register for the contest",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Check if already registered
      const { data: existingReg } = await supabase
        .from('contest_participants')
        .select('id')
        .eq('contest_id', id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingReg) {
        setIsRegistered(true);
        toast({
          title: "Already Registered",
          description: "You are already registered for this contest",
        });
        return;
      }

      // Insert participant data
      const { error: participantError } = await supabase
        .from('contest_participants')
        .insert({
          contest_id: id,
          user_id: session.user.id,
          profile_id: session.user.id,
          registration_time: new Date().toISOString(),
          score: 0,
          solved_problems: 0,
          rank: 0,
          status: 'registered'
        });

      if (participantError) throw participantError;

      setIsRegistered(true);
      toast({
        title: "Success",
        description: "Successfully registered for the contest",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error joining contest:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the contest",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader 
          type="spinner"
          size="large"
          message="Loading contest details..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 space-y-6 bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
            <p className="text-gray-300">{error}</p>
            <Button
              onClick={() => navigate('/contests')}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Back to Contests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 space-y-6 bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">Contest Not Found</h1>
            <p className="text-gray-300">The contest you're looking for doesn't exist or has been removed.</p>
            <Button
              onClick={() => navigate('/contests')}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Back to Contests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
                className={`w-full transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader type="spinner" size="small" />
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Join Contest'
                )}
              </Button>
            ) : new Date(contest.start_time) <= new Date() ? (
              <Button
                onClick={() => navigate(`/contest/${id}/problems`)}
                className="w-full bg-green-600 hover:bg-green-700 transition-colors"
              >
                Start Contest
              </Button>
            ) : (
              <Button
                disabled
                className="w-full bg-green-600 opacity-50 cursor-not-allowed"
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