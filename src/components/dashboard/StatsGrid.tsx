import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, FileCode2, Users2, BrainCircuit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionCounts {
  code_questions: number;
  video_round_question: number;
  hr_questions: number;
  total_questions: number;
}

export function StatsGrid() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<QuestionCounts>({
    code_questions: 0,
    video_round_question: 0,
    hr_questions: 0,
    total_questions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch(`http://localhost:8000/api/question-counts/${user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch question counts');
        }
        const data = await response.json();
        setCounts(data);
      } catch (error) {
        console.error('Error fetching question counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user?.email]);

  const stats = [
    {
      title: "Code Questions",
      value: counts.code_questions,
      description: "Total unique coding problems solved",
      icon: Code2,
    },
    {
      title: "DSA Questions",
      value: counts.video_round_question,
      description: "Total unique DSA problems solved",
      icon: FileCode2,
    },
    {
      title: "HR Questions",
      value: counts.hr_questions,
      description: "Total unique HR interview questions",
      icon: Users2,
    },
    {
      title: "Total Questions",
      value: counts.total_questions,
      description: "Combined total of all questions",
      icon: BrainCircuit,
    },
  ];

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}