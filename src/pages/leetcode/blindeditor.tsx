
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FaClock, FaCopy, FaPaste, FaRedo, FaTrash } from 'react-icons/fa';
import problems from '../../../api/leetcode/scraped_problems.json';
import Editor from '@monaco-editor/react';
import { useToast } from "@/hooks/use-toast";

interface Problem {
  id: string;
  title: string;
  description: string;
  topic: string;
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
  const [timer, setTimer] = useState(300); // 5 minutes timer
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

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

  const handleApproachSubmit = () => {
    if (!approach.trim()) {
      toast({
        title: "Error",
        description: "Please write your approach before proceeding",
        variant: "destructive",
      });
      return;
    }
    setShowEditor(true);
    setIsRunning(true);
  };

  const handleCodeSubmit = () => {
    toast({
      title: "Success",
      description: "Code submitted successfully!",
    });
    setIsRunning(false);
    setOutput(`Output for the ${language} code:\n${code}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied",
      description: "Output copied to clipboard",
    });
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setOutput(text);
      toast({
        title: "Pasted",
        description: "Output pasted from clipboard",
      });
    });
  };

  const handleClean = () => {
    setCode('');
    setOutput('');
    toast({
      title: "Cleaned",
      description: "Editor cleaned",
    });
  };

  const handleRestart = () => {
    setTimer(300);
    setIsRunning(true);
    setOutput('');
    toast({
      title: "Restarted",
      description: "Timer restarted",
    });
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description Panel */}
          <Card className="bg-gray-800 border-none shadow-xl">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-primary mb-2">{problem.title}</h1>
              <div className="text-sm text-primary/80 mb-4">Topic: {problem.topic}</div>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
              {!showEditor && (
                <div className="mt-6 space-y-4">
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
                  >
                    Submit Approach
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

                <div className="flex justify-between gap-4">
                  <Button
                    onClick={handleCodeSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Submit Solution
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleCopy}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaCopy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handlePaste}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaPaste className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleClean}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={handleRestart}
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <FaRedo className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {output && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-700">
                    <h3 className="font-semibold text-lg mb-2">Output:</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {output}
                    </pre>
                  </div>
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

