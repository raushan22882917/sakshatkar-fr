import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionTimer } from "@/components/QuestionTimer";
import { ComplexityInputs } from "@/components/ComplexityInputs";
import { CodeOutput } from "@/components/CodeOutput";
import { useToast } from "@/components/ui/use-toast";
import { codeExecutionService } from "@/services/codeExecutionService";
import type { TestCase } from "@/types/mentorship";

interface SolutionFormProps {
  testCases?: TestCase[];
  onSubmit?: (solution: string) => void;
  language?: string;
}

export function SolutionForm({ testCases = [], onSubmit, language = 'javascript' }: SolutionFormProps) {
  const [solution, setSolution] = useState("");
  const [timeComplexity, setTimeComplexity] = useState("");
  const [spaceComplexity, setSpaceComplexity] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const maxTime = 3600; // 1 hour in seconds
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim()) {
      toast({
        title: "Error",
        description: "Please enter your solution",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await codeExecutionService.executeCode({
        code: solution,
        language,
        input: testCases[0]?.input
      });

      if (response.error) {
        setError(response.error);
        setOutput(null);
      } else {
        setOutput(response.output);
        setError(null);
      }

      onSubmit?.(solution);
    } catch (err: any) {
      setError(err.message || "Failed to execute code");
      setOutput(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <QuestionTimer 
        timeSpent={timeSpent} 
        maxTime={maxTime}
        onTimeUpdate={(time) => setTimeSpent(time)}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Write your solution here..."
          className="min-h-[300px] font-mono"
        />

        <ComplexityInputs
          timeComplexity={timeComplexity}
          spaceComplexity={spaceComplexity}
          onTimeComplexityChange={setTimeComplexity}
          onSpaceComplexityChange={setSpaceComplexity}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSolution("")}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Running..." : "Run Code"}
          </Button>
        </div>
      </form>

      <CodeOutput
        output={output}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}