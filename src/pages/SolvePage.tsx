import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepProgress } from "@/components/StepProgress";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { TestCase, Problem, AIDetectionResult } from "@/types/global";
import { Loader2 } from "lucide-react";
import { ProblemDescription } from "@/components/problem/ProblemDescription";
import { SolutionEditor } from "@/components/problem/SolutionEditor";

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
  const [problem, setProblem] = useState<Problem | null>(null);

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
            <ProblemDescription problem={problem} />
            <SolutionEditor 
              testCases={editorTestCases}
              onTestCasesChange={setEditorTestCases}
            />
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