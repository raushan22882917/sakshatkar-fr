
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaClock, FaCopy, FaPaste, FaRedo, FaTrash, FaPlay, FaChartLine } from 'react-icons/fa';
import problems from '../../../api/leetcode/scraped_problems.json';
import Editor from '@monaco-editor/react';
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { codeExecutionService } from '@/services/codeExecutionService';
import { evaluationService } from '@/services/evaluationService';

interface Problem {
  id: string;
  title: string;
  description: string;
  topic: string;
}

interface TestResult {
  passed: boolean;
  executionTime: number;
  memoryUsage: number;
  output: string;
}

const BlindEditor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const id = searchParams.get('id');

  const [problem, setProblem] = useState<Problem | null>(null);
  const [approach, setApproach] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [code, setCode] = useState<string>('// Write your code here');
  const [language, setLanguage] = useState<string>('javascript');
  const [timer, setTimer] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  useEffect(() => {
    if (id) {
      const currentProblem = problems.find((p: Problem) => p.id === id);
      if (currentProblem) {
        setProblem(currentProblem);
      }
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      toast({
        title: "Time's up!",
        description: "Your coding session has ended.",
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timer, toast]);

  const handleApproachSubmit = async () => {
    if (!approach.trim()) {
      toast({
        title: "Error",
        description: "Please write your approach before proceeding",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await evaluationService.evaluate({
        question_id: id || '',
        step: 'solution',
        content: approach
      });

      toast({
        title: "Approach Evaluated",
        description: `Score: ${result.score}/100. ${result.feedback}`,
      });
    } catch (error) {
      toast({
        title: "Evaluation Error",
        description: "Failed to evaluate approach",
        variant: "destructive",
      });
    }
    setIsAnalyzing(false);
    setShowEditor(true);
    setIsRunning(true);
  };

  const handleRunCode = async () => {
    try {
      const result = await codeExecutionService.executeCode({
        code,
        language,
        input: ''
      });

      const testResult: TestResult = {
        passed: !result.error,
        executionTime: parseFloat(result.cpuTime || '0'),
        memoryUsage: parseFloat(result.memory || '0'),
        output: result.output || result.error || ''
      };

      setTestResults(prev => [...prev, testResult]);
      setOutput(testResult.output);

      toast({
        title: testResult.passed ? "Success" : "Error",
        description: testResult.passed ? "Code executed successfully!" : "Execution failed",
        variant: testResult.passed ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute code",
        variant: "destructive",
      });
    }
  };

  const handleFinalSubmission = async () => {
    setIsAnalyzing(true);
    try {
      const result = await evaluationService.evaluateAnswer(
        { ...problem!, type: 'coding', evaluationCriteria: ['correctness', 'efficiency', 'style'] },
        code,
        language
      );

      setAnalysisResult(result);
      setShowPerformance(true);

      toast({
        title: "Analysis Complete",
        description: `Overall Score: ${result.score}/10`,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze submission",
        variant: "destructive",
      });
    }
    setIsAnalyzing(false);
  };

  const performanceData = testResults.map((result, index) => ({
    name: `Run ${index + 1}`,
    time: result.executionTime,
    memory: result.memoryUsage
  }));

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-8">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description Panel */}
          <Card className="bg-gray-800 border-none shadow-xl">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-primary mb-2">{problem.title}</h1>
              <div className="text-sm text-primary/80 mb-4">Topic: {problem.topic}</div>
              <div 
                className="prose prose-invert max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
              {!showEditor && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-2">Your Approach</h2>
                  <textarea
                    rows={6}
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    className="w-full p-4 rounded-lg bg-gray-700 border-gray-600 focus:ring-primary focus:border-primary"
                    placeholder="Describe your approach to solve this problem..."
                  />
                  <Button 
                    onClick={handleApproachSubmit}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Submit Approach'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor Panel */}
          {showEditor && (
            <Card className="bg-gray-800 border-none shadow-xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Select defaultValue={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[200px] bg-gray-700">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 text-primary">
                    <FaClock className="w-5 h-5" />
                    <span className="font-mono">
                      {`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
                    </span>
                  </div>
                </div>
                
                <div className="h-[calc(100vh-400px)] min-h-[400px] rounded-lg overflow-hidden mb-4">
                  <Editor
                    height="100%"
                    defaultLanguage={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>

                <div className="flex justify-between gap-4 mb-4">
                  <Button
                    onClick={handleRunCode}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <FaPlay className="mr-2 h-4 w-4" />
                    Run Code
                  </Button>
                  <Button
                    onClick={handleFinalSubmission}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isAnalyzing}
                  >
                    <FaChartLine className="mr-2 h-4 w-4" />
                    {isAnalyzing ? 'Analyzing...' : 'Submit & Analyze'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(output);
                        toast({ title: "Copied", description: "Output copied to clipboard" });
                      }}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaCopy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.readText().then((text) => {
                          setOutput(text);
                          toast({
                            title: "Pasted",
                            description: "Output pasted from clipboard",
                          });
                        });
                      }}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaPaste className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        setCode('');
                        setOutput('');
                        toast({
                          title: "Cleaned",
                          description: "Editor cleaned",
                        });
                      }}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        setTimer(300);
                        setIsRunning(true);
                        setOutput('');
                        toast({
                          title: "Restarted",
                          description: "Timer restarted",
                        });
                      }}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaRedo className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {output && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-700">
                    <h3 className="font-semibold text-lg mb-2">Output:</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {output}
                    </pre>
                  </div>
                )}

                {showPerformance && analysisResult && (
                  <Card className="bg-gray-700 border-none mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Overall Score</span>
                            <span>{analysisResult.score}/10</span>
                          </div>
                          <Progress value={analysisResult.score * 10} className="h-2" />
                        </div>

                        {/* Strengths */}
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Strengths:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.strengths.map((strength: string, index: number) => (
                              <li key={index} className="text-green-400">{strength}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Improvements */}
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysisResult.improvements.map((improvement: string, index: number) => (
                              <li key={index} className="text-yellow-400">{improvement}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Performance Graph */}
                        <div className="mt-6">
                          <h4 className="font-medium mb-4">Execution Performance</h4>
                          <div className="w-full h-64 bg-gray-800 rounded-lg p-4">
                            <LineChart
                              width={500}
                              height={200}
                              data={performanceData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Legend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="time"
                                stroke="#8884d8"
                                name="Execution Time (ms)"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="memory"
                                stroke="#82ca9d"
                                name="Memory Usage (MB)"
                              />
                            </LineChart>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlindEditor;
