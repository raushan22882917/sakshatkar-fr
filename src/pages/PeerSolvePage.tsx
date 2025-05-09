import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Editor from "@monaco-editor/react";
import { evaluationService } from "@/services/evaluationService";
import { ArrowLeft, FileText, Tag, Clock, Award } from "lucide-react";
import { peerQuestions } from "@/data/peer_question";
import { Navbar } from "@/components/Navbar";

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  tags: string[];
}

interface CodeRunResponse {
  output: string;
  error?: string;
}

interface EvaluationResponse {
  passed: boolean;
  message: string;
}

export default function PeerSolvePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [executionResult, setExecutionResult] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approach, setApproach] = useState("");

  const languageOptions = {
    python: {
      extension: "py",
      defaultCode: "def solution():\n    # Write your code here\n    pass\n\n# Example usage:\nif __name__ == '__main__':\n    result = solution()\n    print(result)"
    },
    javascript: {
      extension: "js",
      defaultCode: "function solution() {\n    // Write your code here\n}\n\n// Example usage:\nconst result = solution();\nconsole.log(result);"
    },
    java: {
      extension: "java",
      defaultCode: "public class Solution {\n    public static void main(String[] args) {\n        Solution solution = new Solution();\n        // Add your test cases here\n    }\n\n    public void solution() {\n        // Write your code here\n    }\n}"
    },
    cpp: {
      extension: "cpp",
      defaultCode: "#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};\n\nint main() {\n    Solution solution;\n    // Add your test cases here\n    return 0;\n}"
    }
  };

  useEffect(() => {
    if (!id) return;

    // Find the question from peerQuestions data
    for (const topic of peerQuestions) {
      const foundQuestion = topic.questions.find(q => q.id === Number(id));
      if (foundQuestion) {
        setQuestion(foundQuestion);
        break;
      }
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(languageOptions[language as keyof typeof languageOptions].defaultCode);
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      const result: CodeRunResponse = await evaluationService.runCode(code, selectedLanguage, customInput);
      setExecutionResult(result.output || result.error || "No output");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run code. Please try again.",
        variant: "destructive",
      });
    }
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result: EvaluationResponse = await evaluationService.submitCode(code, selectedLanguage, question?.id?.toString());
      toast({
        title: result.passed ? "Success!" : "Test Cases Failed",
        description: result.message,
        variant: result.passed ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit code. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  {question.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {question.timeLimit} mins
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Award className="h-4 w-4 mr-1" />
                    {question.difficulty}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p>{question.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {Object.keys(languageOptions).map((lang) => (
                      <Button
                        key={lang}
                        variant={selectedLanguage === lang ? "default" : "outline"}
                        onClick={() => handleLanguageChange(lang)}
                        className="capitalize"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                  <div className="h-[500px] border rounded-md overflow-hidden">
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Tabs defaultValue="input">
              <TabsList>
                <TabsTrigger value="input">Custom Input</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="approach">Approach</TabsTrigger>
              </TabsList>
              <TabsContent value="input">
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder="Enter your test case input here..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="output">
                <Card>
                  <CardContent className="pt-4">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      {executionResult || "No output yet. Run your code to see results."}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="approach">
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder="Write your approach here..."
                      value={approach}
                      onChange={(e) => setApproach(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button
                onClick={handleRun}
                disabled={isRunning}
                className="flex-1"
              >
                {isRunning ? "Running..." : "Run Code"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
                variant="default"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
