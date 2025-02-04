import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeEditor from "@/components/CodeEditor";
import { StepProgress } from "@/components/StepProgress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { questions } from "@/data/questions";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { evaluationService } from "@/services/evaluationService";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { TestCase } from "@/types/contest";
import { codeExecutionService } from "@/services/codeExecutionService";
import { saplingService } from "@/services/saplingService";
import { SaplingEditor } from "@/components/SaplingEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const steps = [
  {
    title: "Understand the Example",
    description: "Review the example and make sure you understand the problem",
    completed: false,
    current: true,
  },
  {
    title: "Write Approach",
    description: "Explain your solution approach in plain words",
    completed: false,
    current: false,
  },
  {
    title: "Add Test Cases",
    description: "Write additional test cases to validate your solution",
    completed: false,
    current: false,
  },
  {
    title: "Implement Solution",
    description: "Write your code solution",
    completed: false,
    current: false,
  },
  {
    title: "Submit",
    description: "Submit your solution for evaluation",
    completed: false,
    current: false,
  },
];

export default function SolvePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canSolveMoreQuestions, incrementSolvedQuestions } = useSubscription();
  const [currentStep, setCurrentStep] = useState(0);
  const [code, setCode] = useState("");
  const [approach, setApproach] = useState("");
  const [testCases, setTestCases] = useState({
    basic: "",
    edge: "",
    performance: "",
    negative: "",
    boundary: "",
  });
  const [examples, setExamples] = useState([{ input: "", output: "" }]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [stepScores, setStepScores] = useState<{[key: string]: number}>({});
  const [analysisResult, setAnalysisResult] = useState("");
  const [exampleAnalysis, setExampleAnalysis] = useState("");
  const [testCaseAnalysis, setTestCaseAnalysis] = useState("");
  const [codeEvaluation, setCodeEvaluation] = useState(null);
  const [stepData, setStepData] = useState({
    examples: [],
    approach: "",
    testCases: {
      basic: "",
      edge: "",
      performance: "",
      negative: "",
      boundary: "",
    },
    code: "",
  });
  const [editorTestCases, setEditorTestCases] = useState<TestCase[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState<AIDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProblemDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_problems")
        .select("*")
        .eq("id", id)
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

  useEffect(() => {
    fetchProblemDetails();
  }, [id]);

  const handleRunCode = async () => {
    setIsRunningTests(true);
    try {
      const updatedTestCases = [...editorTestCases];
      
      for (const testCase of updatedTestCases) {
        try {
          const result = await codeExecutionService.executeCode({
            code,
            language: selectedLanguage,
            input: testCase.input
          });

          if (result.error) {
            testCase.actualOutput = result.error;
            testCase.passed = false;
          } else {
            testCase.actualOutput = result.output.trim();
            testCase.passed = testCase.actualOutput === testCase.expectedOutput.trim();
          }
        } catch (error: any) {
          testCase.actualOutput = error.message || "Error executing test case";
          testCase.passed = false;
        }
      }

      setEditorTestCases(updatedTestCases);

      const resultText = updatedTestCases.map(testCase => `
Input: ${testCase.input}
Expected Output: ${testCase.expectedOutput}
Actual Output: ${testCase.actualOutput || ''}
Status: ${testCase.passed ? '✅ Passed' : '❌ Failed'}
${testCase.explanation ? `Explanation: ${testCase.explanation}` : ''}
`).join('\n');

      setExecutionResult(resultText);

      const allPassed = updatedTestCases.every(tc => tc.passed);
      const passedCount = updatedTestCases.filter(tc => tc.passed).length;
      const totalCount = updatedTestCases.length;
      const passRate = Math.round((passedCount / totalCount) * 100);
      
      toast({
        title: allPassed ? `All Tests Passed! (${passRate}%) 🎉` : `Some Tests Failed (${passRate}%)`,
        description: allPassed 
          ? "Your code successfully passed all test cases" 
          : `Passed ${passedCount}/${totalCount} test cases. Check the results for details.`,
        variant: allPassed ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('Code execution error:', error);
      setExecutionResult(`Error executing code: ${error.message}`);
      toast({
        title: "Execution Error",
        description: error.message || "Failed to execute code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center py-12">Problem not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          {/* Left Column - Problem Description and Code Editor */}
          <div className="space-y-6">
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
                      {(problem.test_cases as TestCase[]).map((testCase, index) => (
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

            {/* Code Editor Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    testCases={editorTestCases}
                    onTestCasesChange={setEditorTestCases}
                  />
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleRunCode} 
                      disabled={isRunning || !code.trim()}
                      className="w-full"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        'Run Code'
                      )}
                    </Button>
                  </div>

                  {executionResult && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Execution Results</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                          {executionResult}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress and Steps */}
          <div className="space-y-6">
            <Card className="shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <StepProgress steps={steps.map((step, index) => ({
                  ...step,
                  completed: index < currentStep,
                  current: index === currentStep,
                }))} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        feedback={feedback}
        title={problem?.title || ""}
        description={problem?.description || ""}
      />
    </div>
  );
}
