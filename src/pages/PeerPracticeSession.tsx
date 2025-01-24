import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { AiOutlineTeam, AiOutlineCode, AiOutlineFileText, AiOutlinePlayCircle, AiOutlineLoading3Quarters } from "react-icons/ai";

interface SessionMember {
  email: string;
  name: string;
}

interface PeerSession {
  id: string;
  question: string;
  description: string;
  test_cases: string[];
  peer_groups: {
    name: string;
    members: string[];
  };
}

export default function PeerPracticeSession() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<PeerSession | null>(null);
  const [members, setMembers] = useState<SessionMember[]>([]);
  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState("");
  const [approach, setApproach] = useState("");
  const [testCases, setTestCases] = useState({
    basic: "",
    edge: "",
    performance: "",
    negative: "",
    boundary: ""
  });

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
    if (!sessionId || !user) return;

    const fetchSessionDetails = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('peer_sessions')
          .select(`
            *,
            peer_groups (
              name,
              members
            ),
            peer_questions:questions (
              id,
              title,
              description,
              test_cases,
              example_input,
              example_output,
              constraints
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        // Transform the data to match our PeerSession interface
        const transformedData: PeerSession = {
          id: sessionData.id,
          question: sessionData.peer_questions[0]?.title || '',
          description: sessionData.peer_questions[0]?.description || '',
          test_cases: sessionData.peer_questions[0]?.test_cases || [],
          peer_groups: {
            name: sessionData.peer_groups.name,
            members: sessionData.peer_groups.members
          }
        };

        setSession(transformedData);

        if (sessionData.peer_groups?.members) {
          const { data: membersData, error: membersError } = await supabase
            .from('profiles')
            .select('email, name')
            .in('email', sessionData.peer_groups.members);

          if (membersError) throw membersError;
          setMembers(membersData || []);
        }

        // Set default code based on selected language
        setCode(languageOptions[selectedLanguage as keyof typeof languageOptions].defaultCode);
      } catch (error: any) {
        console.error('Error fetching session details:', error);
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive",
        });
      }
    };

    fetchSessionDetails();
  }, [sessionId, user, selectedLanguage]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(languageOptions[language as keyof typeof languageOptions].defaultCode);
  };

  const handleRunCode = async (isSubmission = false) => {
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
        ...(isSubmission && { testCases: session?.test_cases })
      };

      const result = await evaluationService.evaluate({
        question_id: sessionId || '',
        step: isSubmission ? 'solution' : 'code', 
        content: JSON.stringify(payload)
      });

      if (!result || !result.feedback) {
        throw new Error("Invalid response from evaluation service");
      }

      const resultContent = JSON.parse(result.feedback);
      
      if (!resultContent || !resultContent.result) {
        throw new Error("Invalid result format from evaluation service");
      }

      setExecutionResult(resultContent.result);

      if (isSubmission) {
        // Record the submission
        await supabase.from('peer_submissions').insert({
          user_id: user?.id,
          session_id: sessionId,
          code: code,
          language: selectedLanguage,
          score: result.score,
          status: result.score >= 80 ? 'ACCEPTED' : 'WRONG_ANSWER'
        });

        toast({
          title: "Submission Complete",
          description: `Score: ${result.score}%`,
          variant: result.score >= 80 ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Code Execution Complete",
          description: "Check the output below",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Code execution error:', error);
      setExecutionResult(`Error: ${error.message || "Failed to execute code. Please try again."}`);
      toast({
        title: "Execution Error",
        description: error.message || "Failed to execute code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsRunning(false);
    }
  };

  const handleSubmit = () => handleRunCode(true);

  if (!session) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navigation Bar */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded bg-background"
            >
              <option value="python">Python3</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => handleRunCode(false)}
              variant="outline"
              disabled={isRunning || isSubmitting}
              className="h-8 text-sm"
            >
              {isRunning ? (
                <>
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <AiOutlinePlayCircle className="mr-2 h-4 w-4" />
                  Run
                </>
              )}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || isRunning}
              className="h-8 text-sm bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <AiOutlineCode className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-[400px] flex flex-col border-r bg-card overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold">{session.question}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">Medium</Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Acceptance: 65.2%
                  </Badge>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">{session.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Example 1:</h3>
                <pre className="bg-muted p-3 rounded-lg text-sm">
                  <code>Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</code>
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Constraints:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>2 ≤ nums.length ≤ 104</li>
                  <li>-109 ≤ nums[i] ≤ 109</li>
                  <li>-109 ≤ target ≤ 109</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t">
            <div className="p-4">
              <h3 className="font-medium mb-2">Session Members</h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.email} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">{member.name || member.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Editor and Console */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage={selectedLanguage}
              language={selectedLanguage}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10 },
                folding: true,
                renderLineHighlight: "all",
                suggestOnTriggerCharacters: true,
                formatOnType: true,
                formatOnPaste: true
              }}
            />
          </div>

          {/* Console Panel */}
          <div className="h-[300px] border-t bg-card flex flex-col">
            <div className="flex items-center px-4 h-10 border-b bg-muted">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-sm">
                  Console
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-sm">
                  Test Cases
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-auto">
              <div>
                <h3 className="text-sm font-medium mb-2">Custom Input</h3>
                <Textarea
                  placeholder="Enter your custom input here..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="font-mono text-sm h-20 resize-none"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Output</h3>
                {executionResult ? (
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                    {executionResult}
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground text-center">
                    Run your code to see the output here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
