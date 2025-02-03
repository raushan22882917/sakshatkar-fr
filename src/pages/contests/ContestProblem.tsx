import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import CodeEditor from "@/components/CodeEditor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Problem, TestCase } from "@/types/contest";

export default function ContestProblem() {
  const { id, problemId } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblemDetails();
  }, [problemId]);

  const fetchProblemDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_problems")
        .select("*")
        .eq("id", problemId)
        .single();

      if (error) throw error;
      setProblem(data);
    } catch (error) {
      console.error("Error fetching problem details:", error);
      toast({
        title: "Error",
        description: "Failed to load problem details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center py-12">Problem not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Description */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <Badge>{problem.difficulty}</Badge>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Problem Description</h3>
                <p>{problem.description}</p>
              </div>
              
              {problem.constraints && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Constraints</h3>
                  <pre className="bg-muted p-4 rounded-md">{problem.constraints}</pre>
                </div>
              )}
              
              {problem.input_format && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Input Format</h3>
                  <p>{problem.input_format}</p>
                </div>
              )}
              
              {problem.output_format && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Output Format</h3>
                  <p>{problem.output_format}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">Example Test Cases</h3>
                {(problem.test_cases as TestCase[]).map((testCase, index) => (
                  <div key={index} className="bg-muted p-4 rounded-md mb-4">
                    <p><strong>Input:</strong> {testCase.input}</p>
                    <p><strong>Expected Output:</strong> {testCase.expectedOutput}</p>
                    {testCase.explanation && (
                      <p><strong>Explanation:</strong> {testCase.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Code Editor */}
        <div>
          <CodeEditor
            value={code}
            onChange={setCode}
            testCases={problem.test_cases as TestCase[]}
          />
        </div>
      </div>
    </div>
  );
}