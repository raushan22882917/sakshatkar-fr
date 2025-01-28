import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityData {
  date: string;
  score: number;
  attempts: number;
}

export function ActivityChart() {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return;

      try {
        const today = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const { data: submissions } = await supabase
          .from('submissions')
          .select('created_at, example_score, approach_score, testcase_score, code_score')
          .eq('user_id', user.id)
          .gte('created_at', last30Days[0]);

        const dailyData = last30Days.map(date => {
          const daySubmissions = submissions?.filter(sub => 
            sub.created_at.split('T')[0] === date
          ) || [];

          const totalScore = daySubmissions.reduce((sum, sub) => 
            sum + (sub.example_score + sub.approach_score + sub.testcase_score + sub.code_score), 0);

          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: totalScore,
            attempts: daySubmissions.length
          };
        });

        setActivityData(dailyData);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [user]);

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Daily Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                name="Total Score"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="attempts" 
                stroke="#82ca9d" 
                name="Questions Attempted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}