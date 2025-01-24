import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Editor } from "@monaco-editor/react";
import { Separator } from "@/components/ui/separator";
import {
  AiOutlinePlayCircle,
  AiOutlineSend,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import type { Problem, TestCase } from "@/types/contest";

type Language = "python" | "javascript" | "cpp";

const languageOptions: Record<Language, {
  id: Language;
  name: string;
  defaultCode: string;
}> = {
  python: {
    id: "python",
    name: "Python",
    defaultCode: "def solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()",
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    defaultCode: "function solve() {\n    // Write your code here\n}\n\nsolve();",
  },
  cpp: {
    id: "cpp",
    name: "C++",
    defaultCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
  },
};

export default function ContestProblem() {
  const { contestId, problemId } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("python");
  const [code, setCode] = useState(languageOptions.python.defaultCode);
  const [customInput, setCustomInput] = useState("");
  const [executionResult, setExecutionResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!problemId || !contestId) return;
    fetchProblemDetails();
  }, [problemId, contestId]);

  const fetchProblemDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_problems")
        .select(`
          id,
          contest_id,
          title,
          description,
          difficulty,
          points,
          constraints,
          input_format,
          output_format,
          time_limit,
          memory_limit,
          test_cases,
          solved_count,
          attempted_count
        `)
        .eq("id", problemId)
        .eq("contest_id", contestId)
        .single();

      if (error) throw error;
      setProblem(data);
    } catch (error) {
      console.error("Error fetching problem details:", error);
      toast({
        title: "Error",
        description: "Failed to load problem details",
        variant: "destructive",
      });
    }
  };

  const handleRunCode = async (isSubmission = false) => {
    if (!problem || !user) return;

    try {
      if (isSubmission) {
        setIsSubmitting(true);
      } else {
        setIsRunning(true);
      }
      setExecutionResult("");

      const payload = {
        code,
        language: selectedLanguage,
        input: customInput,
        problemId: problem.id,
        testCases: isSubmission ? problem.test_cases : undefined,
      };

      // Call your code evaluation service here
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Code execution failed");
      }

      setExecutionResult(result.output);

      if (isSubmission) {
        // Record the submission
        const { error: submissionError } = await supabase
          .from("contest_submissions")
          .insert({
            user_id: user.id,
            contest_id: contestId,
            problem_id: problemId,
            code: code,
            language: selectedLanguage,
            status: result.passed ? "ACCEPTED" : "WRONG_ANSWER",
            score: result.score,
            execution_time: result.executionTime,
            memory_used: result.memoryUsed,
          });

        if (submissionError) throw submissionError;

        toast({
          title: result.passed ? "All Test Cases Passed!" : "Some Test Cases Failed",
          description: `Score: ${result.score}%`,
          variant: result.passed ? "default" : "destructive",
        });
      }
    } catch (error: any) {
      console.error("Code execution error:", error);
      setExecutionResult(`Error: ${error.message}`);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsRunning(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Problem Description Panel */}
      <div className="w-1/2 p-6 overflow-y-auto border-r">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                {problem.difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {problem.points} points
              </span>
            </div>
          </div>

          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Input Format</h3>
                  <ReactMarkdown>{problem.input_format}</ReactMarkdown>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Output Format</h3>
                  <ReactMarkdown>{problem.output_format}</ReactMarkdown>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              {(problem.test_cases as TestCase[]).map((testCase, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-medium">Example {index + 1}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm font-medium mb-1">Input:</div>
                      <pre className="p-3 bg-muted rounded-md">{testCase.input}</pre>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Output:</div>
                      <pre className="p-3 bg-muted rounded-md">{testCase.output}</pre>
                    </div>
                    {testCase.explanation && (
                      <div>
                        <div className="text-sm font-medium mb-1">Explanation:</div>
                        <ReactMarkdown>{testCase.explanation}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="constraints" className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{problem.constraints}</ReactMarkdown>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Time Limit:</span>
                  <span>{problem.time_limit} seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Memory Limit:</span>
                  <span>{problem.memory_limit} MB</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value as Language;
                setSelectedLanguage(lang);
                setCode(languageOptions[lang].defaultCode);
              }}
              className="px-3 py-1 rounded-md border bg-transparent"
            >
              {Object.values(languageOptions).map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleRunCode(false)}
                disabled={isRunning || isSubmitting}
                variant="outline"
                className="gap-2"
              >
                {isRunning ? (
                  <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                ) : (
                  <AiOutlinePlayCircle className="h-4 w-4" />
                )}
                Run Code
              </Button>
              <Button
                onClick={() => handleRunCode(true)}
                disabled={isRunning || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                ) : (
                  <AiOutlineSend className="h-4 w-4" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage={selectedLanguage}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              automaticLayout: true,
            }}
          />
        </div>

        <div className="h-1/3 border-t">
          <Tabs defaultValue="input">
            <div className="flex items-center justify-between p-2 border-b">
              <TabsList>
                <TabsTrigger value="input">Custom Input</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="input" className="h-full">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
                placeholder="Enter your custom input here..."
              />
            </TabsContent>

            <TabsContent value="output" className="h-full">
              <pre className="w-full h-full p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
                {executionResult || "Run your code to see the output here..."}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
