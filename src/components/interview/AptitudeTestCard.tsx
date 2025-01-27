import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Target } from "lucide-react";
import { AptitudeTest } from "@/types/aptitude";

interface AptitudeTestCardProps {
  test: AptitudeTest;
  onStart: (testId: string) => void;
}

export function AptitudeTestCard({ test, onStart }: AptitudeTestCardProps) {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{test.title}</CardTitle>
            <CardDescription>{test.company}</CardDescription>
          </div>
          <Target className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{test.duration} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{test.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {test.difficulty}
              </span>
            </div>
          </div>

          {test.completionRate !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span>{test.completionRate}%</span>
              </div>
              <Progress value={test.completionRate} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(test.categories).map(([category, count]) => (
              <div key={category} className="text-sm">
                <span className="capitalize">{category}:</span>
                <span className="ml-1 font-medium">{count}</span>
              </div>
            ))}
          </div>

          <Button 
            className="w-full"
            onClick={() => onStart(test.id)}
          >
            Start Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}