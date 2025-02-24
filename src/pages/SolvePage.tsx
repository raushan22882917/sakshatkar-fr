import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeEditor from "@/components/CodeEditor";
import { StepProgress } from "@/components/StepProgress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Navbar } from "@/components/Navbar";
import { questions, practiceQuestions } from "@/data/questions";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { evaluationService } from "@/services/evaluationService";
import axios from "axios";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { TestCase } from "@/types/contest";
import { codeExecutionService } from "@/services/codeExecutionService";
import { saplingService } from "@/services/saplingService";
import { SaplingEditor } from "@/components/SaplingEditor";
import { Clock, Award, Plus, Loader2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface AIDetectionResult {
  approachScore?: number;
  codeScore?: number;
  hasAIContent: boolean;
}

const callGroqAPI = async (systemPrompt: string, userPrompt: string) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.");
    }

    const response = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.error?.message) {
        throw new Error(`GROQ API Error: ${errorData.error.message}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from GROQ API");
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("GROQ API Error:", error);
    if (error.message.includes("API key")) {
      throw new Error("Authentication Error: Please check your GROQ API key configuration.");
    }
    throw error;
  }
};

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

const SolvePage: React.FC = () => {
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

  const path = window.location.pathname.split("/")[1];
  const question = id
    ? questions[Number(id) as keyof typeof questions]
    : practiceQuestions[path as keyof typeof practiceQuestions];

  const handleAddExample = () => {
    setExamples([...examples, { input: "", output: "" }]);
  };

  const handleTestCaseChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: string) => {
    setTestCases((prevState) => ({
      ...prevState,
      [type]: e.target.value,
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (question && currentStep === 3) {
      const exampleTestCases: TestCase[] = question.examples.map(example => ({
        input: example.input,
        expectedOutput: example.expectedOutput,
        explanation: example.explanation
      }));
      
      const basicTestCases = question.testCases.basic.map(test => ({
        input: test.input,
        expectedOutput: test.expectedOutput,
        explanation: test.explanation
      }));

      setEditorTestCases([...exampleTestCases, ...basicTestCases]);
    }
  }, [question, currentStep]);

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

  const handleContinue = () => {
    if (examples.length < 3) {
      toast({
        title: "More Examples Needed",
        description: "Please provide at least 3 examples to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setStepData(prev => ({
      ...prev,
      examples: examples
    }));
    
    setCurrentStep(1);
    toast({
      title: "Examples Saved",
      description: "Moving to the next step...",
    });
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      let isValid = true;
      
      switch (currentStep) {
        case 1: // Approach
          if (!approach.trim()) {
            toast({
              title: "Approach Required",
              description: "Please explain your approach before continuing.",
              variant: "destructive",
            });
            isValid = false;
          } else {
            setStepData(prev => ({
              ...prev,
              approach: approach
            }));
          }
          break;
          
        case 2: // Test Cases
          if (!Object.values(testCases).some(tc => tc.trim())) {
            toast({
              title: "Test Cases Required",
              description: "Please provide at least one test case.",
              variant: "destructive",
            });
            isValid = false;
          } else {
            setStepData(prev => ({
              ...prev,
              testCases: testCases
            }));
          }
          break;
          
        case 3: // Code
          if (!code.trim()) {
            toast({
              title: "Code Required",
              description: "Please write your solution code.",
              variant: "destructive",
            });
            isValid = false;
          } else {
            setStepData(prev => ({
              ...prev,
              code: code
            }));
          }
          break;
      }

      if (isValid) {
        setCurrentStep((current) => current + 1);
        toast({
          title: "Step Saved",
          description: "Moving to the next step...",
        });
      }
    }
  };

  const analyzeSolution = async () => {
    try {
      toast({
        title: "Starting Analysis",
        description: "Analyzing your solution step by step...",
      });

      let analyses = {
        examples: "",
        approach: "",
        testCases: "",
        code: ""
      };

      const formattedExamples = stepData.examples.map((ex, i) => 
        `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`
      ).join('\n\n');

      const systemPrompt = `You are an expert coding instructor that evaluates coding examples. 
Provide feedback based on the following categories: Good, Bad, Very Good, Excellent, Awesome, and Need Improvement.
Also assign a score between 1 to 5 based on the quality.

Evaluate based on:
1. Clarity and completeness
2. Coverage of different scenarios
3. Edge case consideration

Format your response as:
Rating: [category]
Score: [1-5]
Analysis: [your detailed analysis]
Suggestions: [specific suggestions if any]`;

      const userPrompt = `Problem: ${question.title}
Description: ${question.description}

Examples Provided:
${formattedExamples}`;

      analyses.examples = await callGroqAPI(systemPrompt, userPrompt);
      if (!analyses.examples.includes("Score:")) {
        throw new Error("Invalid analysis format. Please try again.");
      }

      const systemPrompt2 = `You are an expert coding instructor that evaluates solution approaches.
Provide feedback based on the following categories: Good, Bad, Very Good, Excellent, Awesome, and Need Improvement.
Also assign a score between 1 to 5 based on the quality.

Evaluate based on:
1. Clarity of explanation
2. Problem understanding
3. Solution completeness

Format your response as:
Rating: [category]
Score: [1-5]
Analysis: [your detailed analysis]
Suggestions: [specific suggestions if any]`;

      const userPrompt2 = `Problem: ${question.title}
Description: ${question.description}

Student's Approach:
${stepData.approach}`;

      analyses.approach = await callGroqAPI(systemPrompt2, userPrompt2);
      if (!analyses.approach.includes("Score:")) {
        throw new Error("Invalid analysis format. Please try again.");
      }

      const formattedTestCases = Object.entries(stepData.testCases).map(([type, cases]) => 
        `${type.charAt(0).toUpperCase() + type.slice(1)} Test Cases:\n${cases}`
      ).join('\n\n');

      const systemPrompt3 = `You are an expert coding instructor that evaluates test cases.
Provide feedback based on the following categories: Good, Bad, Very Good, Excellent, Awesome, and Need Improvement.
Also assign a score between 1 to 5 based on the quality.

Evaluate based on:
1. Coverage of different scenarios
2. Edge case consideration
3. Test case quality and completeness

Format your response as:
Rating: [category]
Score: [1-5]
Analysis: [your detailed analysis]
Suggestions: [specific suggestions if any]`;

      const userPrompt3 = `Problem: ${question.title}
Description: ${question.description}

Test Cases Provided:
${formattedTestCases}`;

      analyses.testCases = await callGroqAPI(systemPrompt3, userPrompt3);
      if (!analyses.testCases.includes("Score:")) {
        throw new Error("Invalid analysis format. Please try again.");
      }

      const systemPrompt4 = `You are an expert coding instructor that evaluates code solutions.
Provide feedback based on the following categories: Good, Bad, Very Good, Excellent, Awesome, and Need Improvement.
Also assign a score between 1 to 5 based on the quality.

Evaluate based on:
1. Code correctness
2. Time and space complexity
3. Code quality and best practices

Format your response as:
Rating: [category]
Score: [1-5]
Analysis: [your detailed analysis]
Suggestions: [specific suggestions if any]`;

      const userPrompt4 = `Problem: ${question.title}
Description: ${question.description}

Student's Code:
${stepData.code}

Test Cases:
${JSON.stringify(stepData.testCases)}

Examples:
${JSON.stringify(stepData.examples)}`;

      analyses.code = await callGroqAPI(systemPrompt4, userPrompt4);
      if (!analyses.code.includes("Score:")) {
        throw new Error("Invalid analysis format. Please try again.");
      }

      setFeedback(analyses);
      setIsFeedbackOpen(true);
      
      toast({
        title: "Analysis Complete",
        description: "Your solution has been analyzed. View the feedback for details.",
        variant: "default",
      });

    } catch (error) {
      console.error("Analysis Error:", error);
      if (!feedback) {
        setFeedback({
          examples: "Score: 0\nError: Analysis failed",
          approach: "Score: 0\nError: Analysis failed",
          testCases: "Score: 0\nError: Analysis failed",
          code: "Score: 0\nError: Analysis failed"
        });
      }
      setIsFeedbackOpen(true);
      
      toast({
        title: "Analysis Error",
        description: "Some parts of the analysis failed. Please check the feedback for details.",
        variant: "destructive",
      });
    }
  };

  const detectAIContent = async (approach: string, code: string) => {
    try {
      const [approachResult, codeResult] = await Promise.all([
        saplingService.detectAI(approach),
        saplingService.detectAI(code)
      ]);

      const approachScore = approachResult.scores[0];
      const codeScore = codeResult.scores[0];
      const hasAIContent = approachScore > 0.8 || codeScore > 0.8;

      setAiDetectionResult({
        approachScore,
        codeScore,
        hasAIContent
      });

      return hasAIContent;
    } catch (error) {
      console.error('AI detection error:', error);
      toast({
        title: "AI Detection Error",
        description: "Failed to check for AI-generated content. Proceeding with feedback.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleShowFeedback = async () => {
    if (!code.trim() || !approach.trim()) {
      toast({
        title: "Error",
        description: "Please provide both code and approach before requesting feedback",
        variant: "destructive",
      });
      return;
    }

    const hasAIContent = await detectAIContent(approach, code);
    
    if (hasAIContent) {
      toast({
        title: "⚠️ AI Content Detected",
        description: "Our system has detected potential AI-generated content in your submission. Please ensure your work is original.",
        variant: "destructive",
        duration: 6000,
      });
    }

    setIsFeedbackOpen(true);
    analyzeSolution();
  };

  const handleSubmitSolution = async () => {
    if (!canSolveMoreQuestions) {
      toast({
        title: "Subscription Required",
        description: "You've reached the limit of 5 questions in the free version. Please subscribe to continue solving more questions.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your solution.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Analyzing Solution",
        description: "Please wait while we analyze your complete solution...",
      });

      await handleShowFeedback();

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: "Something went wrong while analyzing your solution.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Update the theme on page load based on the user's preference (if using system preference)
    const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(userPrefersDark);
  }, []);

  if (!question) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Question not found</h2>
            <p>The requested question could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updatedSteps = steps.map((step, index) => ({
    ...step,
    completed: index < currentStep,
    current: index === currentStep,
  }));

  const difficultyLevel = (Number(question.difficulty) as 1 | 2) || 1;

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-[#1A1A1A]" : "bg-[#F7F9FC]"}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-border/20 bg-card/50">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {question.title}
                    <Badge variant={
                      difficultyLevel === 1 ? "success" : 
                      difficultyLevel === 2 ? "warning" : "destructive"
                    }>
                      {difficultyLevel === 1 ? "Easy" : 
                       difficultyLevel === 2 ? "Medium" : "Hard"}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      30 min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {question.score || 0} points
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="mb-6">
                    <p className="text-base leading-relaxed">{question.description}</p>
                  </div>

                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Examples:</h3>
                      <div className="grid gap-4">
                        {examples.map((example, index) => (
                          <div key={index} className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Input:</label>
                              <textarea
                                className="w-full min-h-[100px] p-3 rounded-md border bg-muted/50 
                                         font-mono text-sm resize-none focus:ring-1 focus:ring-primary"
                                placeholder="Enter input..."
                                value={example.input}
                                onChange={(e) => {
                                  const newExamples = [...examples];
                                  newExamples[index].input = e.target.value;
                                  setExamples(newExamples);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Output:</label>
                              <textarea
                                className="w-full min-h-[100px] p-3 rounded-md border bg-muted/50 
                                         font-mono text-sm resize-none focus:ring-1 focus:ring-primary"
                                placeholder="Enter output..."
                                value={example.output}
                                onChange={(e) => {
                                  const newExamples = [...examples];
                                  newExamples[index].output = e.target.value;
                                  setExamples(newExamples);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <Button
                          variant="outline"
                          onClick={handleAddExample}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Example
                        </Button>
                        <Button onClick={handleContinue}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-border/20 bg-card/50">
                <CardTitle>Your Solution</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Your Examples</h3>
                      <div className="grid gap-4">
                        {examples.map((example, index) => (
                          <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
                            <div>
                              <p className="text-sm font-medium mb-2">Input:</p>
                              <pre className="font-mono text-sm bg-muted p-3 rounded">{example.input}</pre>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Output:</p>
                              <pre className="font-mono text-sm bg-muted p-3 rounded">{example.output}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Approach:</label>
                      <SaplingEditor
                        value={approach}
                        onChange={setApproach}
                        placeholder="Explain your approach to solving this problem..."
                        className="min-h-[200px] border rounded-md"
                      />
                    </div>
                    <Button onClick={handleNext}>Next</Button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {Object.entries(testCases).map(([type, value]) => (
                        <div key={type} className="space-y-2">
                          <label className="text-sm font-medium capitalize">
                            {type} Test Cases:
                          </label>
                          <Textarea
                            placeholder={`Enter ${type} test cases...`}
                            value={value}
                            onChange={(e) => handleTestCaseChange(e, type)}
                            className="font-mono min-h-[100px]"
                          />
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleNext}>Next</Button>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-card">
                      <div className="border-b border-border/20 p-4">
                        <div className="flex items-center justify-between">
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="cpp">C++</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleRunCode} disabled={isRunningTests}>
                              {isRunningTests ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Running...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Run Code
                                </>
                              )}
                            </Button>
                            <Button onClick={handleNext}>Next</Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-0">
                        <CodeEditor
                          value={code}
                          onChange={(value) => setCode(value || "")}
                          initialLanguage={selectedLanguage}
                          testCases={editorTestCases}
                          onTestCasesChange={setEditorTestCases}
                        />
                      </div>
                    </div>
                    
                    {executionResult && (
                      <div className="rounded-lg border bg-card p-4">
                        <h4 className="font-medium mb-2">Execution Result:</h4>
                        <pre className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
                          {executionResult}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6">
                      <h3 className="text-lg font-semibold mb-4">Review your solution:</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Approach:</h4>
                          <div className="bg-muted rounded p-4">
                            <p className="whitespace-pre-wrap">{approach}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Test Cases:</h4>
                          <div className="bg-muted rounded p-4">
                            <pre className="text-sm overflow-x-auto">
                              {JSON.stringify(testCases, null, 2)}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Code:</h4>
                          <div className="bg-muted rounded p-4">
                            <pre className="text-sm overflow-x-auto">{code}</pre>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button onClick={handleSubmitSolution} disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            "Submit Solution"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-md sticky top-4">
              <CardHeader className="border-b border-border/20 bg-card/50">
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <StepProgress steps={updatedSteps} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        feedback={feedback}
      />
    </div>
  );
};

export default SolvePage;
