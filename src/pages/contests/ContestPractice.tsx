import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PracticeProblem = {
  id: string;
  title: string;
  difficulty: string;
  solved_count: number;
  contest_id: string;
};

export default function ContestPractice() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_problems")
        .select(`
          id,
          title,
          difficulty,
          solved_count,
          contest_id
        `)
        .eq("is_practice", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error("Error fetching practice problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((problem) =>
    difficulty === "all" ? true : problem.difficulty === difficulty
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Practice Problems</h1>
          <p className="text-muted-foreground mt-2">
            Solve problems from past contests
          </p>
        </div>

        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {loading ? (
          // Loading skeletons
          [...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </Card>
          ))
        ) : filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <Card
              key={problem.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{problem.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Solved by {problem.solved_count} users
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    navigate(`/contest/${problem.contest_id}/problem/${problem.id}`)
                  }
                >
                  Solve
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No practice problems found
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
