import { useState, useEffect } from 'react';
import { VideoFeed } from '@/components/VideoFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Editor from '@monaco-editor/react';
import { Play, StopCircle, Send, Timer, Brain, Code2, CheckCircle2, Loader2 } from 'lucide-react';
import { generateQuestions } from '@/services/interviewQuestionService';
import { Question } from '@/types/interview';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { evaluationService } from '@/services/evaluationService';
import { supabase } from '@/lib/supabase';

const languageOptions = [
  { value: 'python', label: 'Python', template: 'def solution():\n    # Write your code here\n    pass' },
  { value: 'java', label: 'Java', template: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}' },
  { value: 'cpp', label: 'C++', template: '#include <iostream>\n\nint main() {\n    // Write your code here\n    return 0;\n}' }
];

export default function VideoInterview() {
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [language, setLanguage] = useState(languageOptions[0].value);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, any>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions.length || 1)) * 100;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSubmitAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: sessionUser }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      if (sessionUser) {
        setUser(sessionUser);
      }
    };

    fetchUser();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!companyName || !position) return;
    
    setIsLoading(true);
    try {
      const generatedQuestions = await generateQuestions(companyName, position);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setTimeLeft(generatedQuestions[0].timeLimit);
      setIsTimerRunning(true);
      setIsStarted(true);
      setCode(languageOptions.find(l => l.value === language)?.template || '');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive"
      });
      console.error("Error starting interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(languageOptions.find(l => l.value === value)?.template || '');
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      // Here you would integrate with a code execution service
      setOutput('Running code...\nOutput will appear here');
    } catch (error) {
      setOutput('Error running code');
    }
    setIsRunning(false);
  };

  const handleSubmitAnswer = async () => {
    setIsEvaluating(true);
    try {
      const evaluation = await evaluationService.evaluateAnswer(
        currentQuestion,
        currentQuestion.type === 'code' ? code : answer,
        currentQuestion.type === 'code' ? language : undefined
      );

      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        score: evaluation.score,
        feedback: evaluation.feedback
      };
      setQuestions(updatedQuestions);

      setEvaluations({
        ...evaluations,
        [currentQuestionIndex]: evaluation
      });

      if (currentQuestionIndex === questions.length - 1) {
        setShowEvaluation(true);
      } else {
        handleNext();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(questions[currentQuestionIndex + 1].timeLimit);
      setIsTimerRunning(true);
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion.type === 'code') {
        setCode(languageOptions.find(l => l.value === language)?.template || '');
      } else {
        setCode('');
      }
      setAnswer('');
      setOutput('');
    }
  };

  const getTotalScore = () => {
    return questions.reduce((total, q) => total + (q.score || 0), 0);
  };

  const submitToDatabase = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to submit your interview results.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const totalScore = getTotalScore();
      
      const interviewData = {
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        company_name: companyName,
        position: position,
        round_number: 1,
        total_score: totalScore,
        interview_date: new Date().toISOString(),
        questions: questions.map((q, index) => ({
          question_type: q.type,
          question_text: q.question,
          score: q.score || 0,
          strengths: evaluations[index]?.strengths || [],
          improvements: evaluations[index]?.improvements || [],
          feedback: evaluations[index]?.feedback
        }))
      };

      const response = await fetch('http://localhost:8000/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        throw new Error('Failed to save interview data');
      }

      toast({
        title: "Success!",
        description: "Your interview results have been submitted successfully.",
        variant: "default",
      });

      setShowEvaluation(false);
    } catch (error) {
      console.error('Error saving interview data:', error);
      toast({
        title: "Error",
        description: "Failed to save interview data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-lg text-muted-foreground">Generating interview questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Navbar />
      {!isStarted ? (
        <Card>
          <CardHeader>
            <CardTitle>Start Video Interview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6 items-center">
  {/* Left Side: GIF Image */}
  <div className="flex justify-center">
    <img 
      src="video-int.gif" 
      alt="Guidance" 
      className="w-164 h-auto rounded-lg"
    />
  </div>

  {/* Right Side: Form with Instructions */}
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Enter Your Job Preferences</h2>
    <p className="text-sm text-gray-600">
      Fill in the details below to personalize your job recommendations.
    </p>

    <div className="space-y-2">
      <label className="text-sm font-medium">Company Name</label>
      <Input
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Enter company name"
      />
      <p className="text-xs text-gray-500">
        Example: Google, Microsoft, Amazon, etc.
      </p>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium">Target Position</label>
      <Input
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Enter target position"
      />
      <p className="text-xs text-gray-500">
        Example: Software Engineer, Data Scientist, Product Manager.
      </p>
    </div>
  </div>
</div>

            <Button onClick={handleStart} disabled={!companyName || !position || isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>

<div className="flex space-x-6 p-6">
  {/* Video Feeds */}
  <div className="w-[200px] h-[400px] flex flex-col space-y-6">
    <VideoFeed isAI />
    <VideoFeed />
  </div>

  {/* Right-side content */}
  <div className="flex flex-col space-y-6 w-full max-w-4xl">
    {/* Progress and Timer */}
    <div className="absolute top-6 right-6 p-4  rounded-full shadow-lg flex items-center justify-between space-x-4">
  {/* Timer */}
  <div className="flex items-center space-x-2">
    <Timer className="h-6 w-6" />
    <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
  </div>
  {/* Progress */}
  <div className="w-16 h-16 flex justify-center items-center relative">
    <Progress value={progress} className="absolute inset-0 rounded-full" />
    <div className="absolute inset-0 flex justify-center items-center">
      <span className="text-sm text-muted-foreground">
        {currentQuestionIndex + 1} / {questions.length}
      </span>
    </div>
  </div>
</div>


    {/* Question and Answer Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Question Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Brain className="h-5 w-5 text-purple-500" />
            {currentQuestion.type.toUpperCase()} Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{currentQuestion.question}</p>
        </CardContent>
      </Card>

      {/* Answer Section */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="font-medium">Your Answer</span>
            {currentQuestion.type === 'code' && (
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.type === 'code' ? (
            <>
              <Editor
                height="300px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
              <div className="space-y-4 mt-4">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleRunCode} disabled={isRunning}>
                    <Play className="mr-2 h-4 w-4" />
                    Run Code
                  </Button>
                </div>
                {output && (
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    {output}
                  </div>
                )}
              </div>
            </>
          ) : (
            <textarea
              className="w-full h-[300px] p-4 rounded-lg border resize-none 
             focus:outline-none focus:ring-2 focus:ring-purple-500 
             bg-transparent text-black dark:text-white placeholder-gray-400"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
            />
          )}
        </CardContent>
      </Card>
    </div>

    {/* Control Buttons */}
    <div className="flex justify-between py-4">
      <Button variant="destructive" onClick={() => setIsStarted(false)}>
        <StopCircle className="mr-2 h-4 w-4" />
        End Interview
      </Button>
      <div className="space-x-2">
        <Button variant="outline" onClick={handleSubmitAnswer}>
          <Send className="mr-2 h-4 w-4" />
          Submit Answer
        </Button>
      </div>
    </div>
  </div>
</div>

        {/* Evaluation Dialog */}
        <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
          <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Interview Evaluation
              </DialogTitle>
              <DialogDescription>
                Detailed feedback for each question
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-8">
              {questions.map((q, i) => {
                const evaluation = evaluations[i];
                return (
                  <div key={i} className="border rounded-lg p-6 space-y-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{q.type.toUpperCase()} Question {i + 1}</h3>
                        <p className="text-muted-foreground">{q.question}</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-500">{evaluation?.score}/10</div>
                    </div>
      
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-500">Strengths</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {evaluation?.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-orange-500">Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {evaluation?.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-sm">{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Total Score Section */}
              <div className="border-t pt-4 mt-8">
                <div className="flex justify-between items-center">
                  <div className="text-xl font-semibold">Total Score</div>
                  <div className="text-3xl font-bold text-purple-500">{getTotalScore()}/50</div>
                </div>
              </div>
      
              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button onClick={submitToDatabase} disabled={isLoading} className="bg-green-500 hover:bg-green-600 text-white" size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Interview Results
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
      
      )}
    </div>
  );
}
