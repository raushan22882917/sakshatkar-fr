import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeEditor from "@/components/CodeEditor";
import { TestCase } from "@/types/global";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { codeExecutionService } from "@/services/codeExecutionService";

interface SolutionEditorProps {
  testCases: TestCase[];
  onTestCasesChange: (testCases: TestCase[]) => void;
}

export function SolutionEditor({ testCases, onTestCasesChange }: SolutionEditorProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunCode = async () => {
    setIsRunningTests(true);
    try {
      const updatedTestCases = [...testCases];
      
      for (const testCase of updatedTestCases) {
        try {
          const result = await codeExecutionService.executeCode({
            code,
            language: "javascript",
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

      onTestCasesChange(updatedTestCases);

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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Solution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            testCases={testCases}
            onTestCasesChange={onTestCasesChange}
          />
          
          <div className="flex gap-4">
            <Button 
              onClick={handleRunCode} 
              disabled={isRunningTests || !code.trim()}
              className="w-full"
            >
              {isRunningTests ? (
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
  );
}