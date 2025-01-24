import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from "@/components/Navbar";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Users, UserCheck, Building, UserCog } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface CodingScore {
  id: number;
  title: string;
  example_score: number;
  approach_score: number;
  testcase_score: number;
  code_score: number;
  created_at: string;
}

interface HRScore {
  id: number;
  company_name: string;
  position: string;
  total_score: number;
  interview_date: string;
  questions: Array<{
    question_text: string;
    answer_text: string;
    score: number;
    feedback: string;
  }>;
}

interface UserScores {
  coding_scores: CodingScore[];
  hr_scores: HRScore[];
}

const codingFeatures = [
  {
    id: 'solo',
    title: 'Solo Coding',
    icon: Code,
    description: 'Track your individual coding practice progress',
  },
  {
    id: 'collaborative',
    title: 'Collaborative Coding',
    icon: Users,
    description: 'View your peer programming sessions and achievements',
  },
  {
    id: 'mentorship',
    title: 'Mentorship Sessions',
    icon: UserCheck,
    description: 'Monitor your mentorship progress and feedback',
  },
  {
    id: 'team',
    title: 'Team Coding',
    icon: Building,
    description: 'See your organization coding activities',
  },
  {
    id: 'hr',
    title: 'HR Round',
    icon: UserCog,
    description: 'Track your interview preparation progress',
  },
];

function CodingScoresTable({ scores }: { scores: CodingScore[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Beginner Coding Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Your coding practice scores</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Problem Title</TableHead>
              <TableHead>Examples</TableHead>
              <TableHead>Approach</TableHead>
              <TableHead>Test Cases</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score) => {
              const total = score.example_score + score.approach_score + 
                          score.testcase_score + score.code_score;
              const date = new Date(score.created_at).toLocaleDateString();
              
              return (
                <TableRow key={score.id}>
                  <TableCell>{score.title}</TableCell>
                  <TableCell>{score.example_score}/10</TableCell>
                  <TableCell>{score.approach_score}/10</TableCell>
                  <TableCell>{score.testcase_score}/10</TableCell>
                  <TableCell>{score.code_score}/10</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(total / 40) * 100} className="w-[60px]" />
                      <span>{total}/40</span>
                    </div>
                  </TableCell>
                  <TableCell>{date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function HRScoresTable({ scores }: { scores: HRScore[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>HR Interview Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Your HR interview scores</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score) => {
              const date = new Date(score.interview_date).toLocaleDateString();
              
              return (
                <TableRow key={score.id}>
                  <TableCell>{score.company_name}</TableCell>
                  <TableCell>{score.position}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(score.total_score / 10) * 100} className="w-[60px]" />
                      <span>{score.total_score}/10</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-h-[100px] overflow-y-auto">
                      {score.questions.map((q, i) => (
                        <div key={i} className="mb-2 text-sm">
                          <p className="font-medium">{q.question_text}</p>
                          <p className="text-gray-500">Score: {q.score}/10</p>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{date}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const [subscription, setSubscription] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<UserScores | null>(null);
  const [activeTab, setActiveTab] = useState('solo');

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/subscriptions/user/${user.id}`);
          const data = await response.json();
          setSubscription(data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
    };

    fetchSubscription();
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchScores();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScores = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/user-scores/${user.email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scores');
      }
      const data = await response.json();
      setScores(data);
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Subscription Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Plan:</span>
                <span className="text-primary font-bold">{subscription?.plan_name || 'Free'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span className={`font-bold ${subscription?.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              {subscription?.end_date && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Expires on:</span>
                  <span className="text-gray-600">
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subscription?.payment_provider && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Last Payment:</span>
                  <div className="text-right">
                    <div>{subscription.payment_provider === 'razorpay' ? 
                      `₹${subscription.amount_inr} (INR)` : 
                      `$${subscription.amount_usd} (USD)`}
                    </div>
                    <div className="text-sm text-gray-500">
                      via {subscription.payment_provider}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/pricing'}
                className="w-full"
              >
                {subscription?.status === 'active' ? 'Change Plan' : 'Upgrade Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your coding progress overview
          </p>
        </div>

        <div className="mb-8">
          <StatsGrid />
        </div>

        <Tabs defaultValue="solo" className="w-full mb-8">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            {codingFeatures.map((feature) => (
              <TabsTrigger 
                key={feature.id} 
                value={feature.id}
                className="flex items-center gap-2"
              >
                <feature.icon className="w-4 h-4" />
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="solo">
            {scores?.coding_scores && (
              <CodingScoresTable scores={scores.coding_scores} />
            )}
          </TabsContent>

          <TabsContent value="hr">
            {scores?.hr_scores && (
              <HRScoresTable scores={scores.hr_scores} />
            )}
          </TabsContent>

          {codingFeatures.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              <div className="grid gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <feature.icon className="w-5 h-5" />
                    {feature.title} Progress
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {feature.description}
                  </p>
                  <ActivityChart />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileCard profile={profile} onProfileUpdate={fetchProfile} />
          </div>
          <div className="md:col-span-2">
            <RecentActivity />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;