import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Trophy, Star, CalendarDays, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

interface Question {
  title: string;
  total_score: number;
}

interface DailyActivity {
  date: string;
  questions_count: number;
  avg_score: number;
  questions: Question[];
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
}

interface ActivityData {
  daily_activity: DailyActivity[];
  current_streak: number;
  longest_streak: number;
  achievements: Achievement[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8884d8]" />
            <span>Questions: {data.questions_count}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(45deg, #00f260, #0575e6)" }} />
            <span>Avg Score: {data.avg_score}/40</span>
          </p>
          <div className="mt-2 pt-2 border-t">
            <p className="font-medium mb-1">Questions Solved:</p>
            <div className="max-h-[100px] overflow-y-auto space-y-1">
              {data.questions.map((q: Question, i: number) => (
                <div key={i} className="text-sm">
                  <span>{q.title}</span>
                  <span className="float-right">{q.total_score}/40</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RecentActivity() {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // Default to 30 days

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch(`http://localhost:8000/api/daily-activity/${user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        const data = await response.json();
        setActivityData(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user?.email]);

  if (loading) {
    return <div>Loading activity...</div>;
  }

  if (!activityData) {
    return null;
  }

  // Format data for the chart
  const chartData = activityData.daily_activity
    .slice(0, parseInt(timeRange))
    .map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      questions_count: day.questions_count,
      avg_score: day.avg_score,
      questions: day.questions
    }))
    .reverse();

  return (
    <div className="grid gap-4 w-400">
      <Card>
        <CardHeader className="space-y-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Coding Activity</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-orange-500" />
                <span className="font-medium">{activityData.current_streak} day streak!</span>
              </div>
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#8884d8]" />
              <span className="ml-2">Questions Solved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(45deg, #00f260, #0575e6)" }} />
              <span className="ml-2">Average Score</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00f260" />
                    <stop offset="100%" stopColor="#0575e6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Questions', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 40]}
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Score', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="questions_count"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg_score"
                  stroke="url(#scoreGradient)"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <ReferenceLine 
                  y={30} 
                  yAxisId="right"
                  label={{ 
                    value: "Good Score",
                    position: "right",
                    fill: "#ffc658",
                    fontSize: 12
                  }}
                  stroke="#ffc658" 
                  strokeDasharray="3 3" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Longest Streak</span>
              </div>
              <span className="font-bold">{activityData.longest_streak} days</span>
            </div>
            
            <div className="grid gap-4">
              {activityData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-secondary rounded-lg"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}