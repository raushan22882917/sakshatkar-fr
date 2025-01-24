import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Check, X } from "lucide-react";

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

interface TestCasesProps {
  testCases: TestCase[];
  onTestCasesChange: (testCases: TestCase[]) => void;
  onRunTests: () => void;
  isRunning: boolean;
}

export function TestCases({ testCases, onTestCasesChange, onRunTests, isRunning }: TestCasesProps) {
  const [newInput, setNewInput] = useState("");
  const [newExpectedOutput, setNewExpectedOutput] = useState("");

  const addTestCase = () => {
    if (newInput.trim() && newExpectedOutput.trim()) {
      onTestCasesChange([
        ...testCases,
        { input: newInput, expectedOutput: newExpectedOutput },
      ]);
      setNewInput("");
      setNewExpectedOutput("");
    }
  };

  const removeTestCase = (index: number) => {
    const updatedTestCases = testCases.filter((_, i) => i !== index);
    onTestCasesChange(updatedTestCases);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Test Cases</h3>
        <Button onClick={onRunTests} disabled={isRunning || testCases.length === 0}>
          Run Tests
        </Button>
      </div>

      <div className="space-y-4">
        {testCases.map((testCase, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-sm font-medium">Input:</label>
                  <div className="mt-1 bg-muted p-2 rounded">{testCase.input}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Output:</label>
                  <div className="mt-1 bg-muted p-2 rounded">{testCase.expectedOutput}</div>
                </div>
                {testCase.actualOutput !== undefined && (
                  <div>
                    <label className="text-sm font-medium">Actual Output:</label>
                    <div className="mt-1 bg-muted p-2 rounded">{testCase.actualOutput}</div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {testCase.passed !== undefined && (
                  <div className={`p-1 rounded-full ${testCase.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    {testCase.passed ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestCase(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">Add New Test Case</h4>
        <div className="space-y-2">
          <Textarea
            placeholder="Input"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            className="min-h-[80px]"
          />
          <Textarea
            placeholder="Expected Output"
            value={newExpectedOutput}
            onChange={(e) => setNewExpectedOutput(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={addTestCase}
            disabled={!newInput.trim() || !newExpectedOutput.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Test Case
          </Button>
        </div>
      </div>
    </div>
  );
}
