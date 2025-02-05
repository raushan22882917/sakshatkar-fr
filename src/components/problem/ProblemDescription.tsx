import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Problem, TestCase } from "@/types/global";

interface ProblemDescriptionProps {
  problem: Problem;
}

export function ProblemDescription({ problem }: ProblemDescriptionProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{problem.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{problem.difficulty}</Badge>
              {problem.tags?.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-400px)] pr-4">
          <div className="prose dark:prose-invert max-w-none">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Problem Description</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </div>
            
            {problem.constraints && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Constraints</h3>
                <pre className="bg-muted p-4 rounded-md text-sm">{problem.constraints}</pre>
              </div>
            )}
            
            {problem.input_format && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Input Format</h3>
                <p className="text-muted-foreground">{problem.input_format}</p>
              </div>
            )}
            
            {problem.output_format && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Output Format</h3>
                <p className="text-muted-foreground">{problem.output_format}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold">Example Test Cases</h3>
              {problem.test_cases.map((testCase, index) => (
                <div key={index} className="bg-muted p-4 rounded-md mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Input:</p>
                      <pre className="text-sm">{testCase.input}</pre>
                    </div>
                    <div>
                      <p className="font-medium">Expected Output:</p>
                      <pre className="text-sm">{testCase.expectedOutput}</pre>
                    </div>
                  </div>
                  {testCase.explanation && (
                    <div className="mt-2">
                      <p className="font-medium">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{testCase.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}