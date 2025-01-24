import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Bot, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { zeroGptService } from "@/services/zeroGptService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface AIDetectionResult {
  approachScore: {
    real: number;
    fake: number;
    ai: number;
  };
  codeScore: {
    real: number;
    fake: number;
    ai: number;
  };
  hasAIContent: boolean;
}

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: {
    examples: string;
    approach: string;
    testCases: string;
    code: string;
  } | null;
  title: string;
  description: string;
}

export function FeedbackDialog({ isOpen, onClose, feedback, title, description }: FeedbackDialogProps) {
  const [aiDetection, setAiDetection] = useState<AIDetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    const detectAI = async () => {
      if (feedback && isOpen) {
        setIsAnalyzing(true);
        setError(null);
        try {
          console.log('Starting AI detection...');
          const [approachResult, codeResult] = await Promise.all([
            zeroGptService.detectAI(feedback.approach),
            zeroGptService.detectAI(feedback.code)
          ]);

          console.log('AI Detection Results:', { approachResult, codeResult });

          setAiDetection({
            approachScore: {
              real: approachResult.real_score,
              fake: approachResult.fake_score,
              ai: approachResult.ai_score
            },
            codeScore: {
              real: codeResult.real_score,
              fake: codeResult.fake_score,
              ai: codeResult.ai_score
            },
            hasAIContent: approachResult.ai_score > 70 || codeResult.ai_score > 70
          });
        } catch (error) {
          console.error('AI detection error in FeedbackDialog:', error);
          setError(error instanceof Error ? error.message : 'Failed to analyze content for AI detection');
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    detectAI();
  }, [feedback, isOpen]);

  // Extract scores from the feedback strings using regex
  const getScore = (text: string): number => {
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) * 20 : 0; // Convert 1-5 score to percentage
  };

  // Extract rating from the feedback strings
  const getRating = (text: string): string => {
    const ratingMatch = text.match(/Rating:\s*(Good|Bad|Very Good|Excellent|Awesome|Need Improvement)/i);
    return ratingMatch ? ratingMatch[1] : "N/A";
  };

  if (!feedback) {
    return null;
  }

  const scores = {
    examples: getScore(feedback.examples),
    approach: getScore(feedback.approach),
    testCases: getScore(feedback.testCases),
    code: getScore(feedback.code),
  };

  const ratings = {
    examples: getRating(feedback.examples),
    approach: getRating(feedback.approach),
    testCases: getRating(feedback.testCases),
    code: getRating(feedback.code),
  };

  const totalScore = Math.round(
    (scores.examples + scores.approach + scores.testCases + scores.code) / 4
  );

  // Get color based on rating
  const getRatingColor = (rating: string): string => {
    switch (rating.toLowerCase()) {
      case 'awesome':
        return 'text-purple-500';
      case 'excellent':
        return 'text-green-500';
      case 'very good':
        return 'text-blue-500';
      case 'good':
        return 'text-yellow-500';
      case 'need improvement':
        return 'text-orange-500';
      case 'bad':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Check if a section has an error
  const hasError = (text: string): boolean => {
    return text.toLowerCase().includes("error:");
  };

  // Extract error message if present
  const getErrorMessage = (text: string): string | null => {
    const errorMatch = text.match(/Error:.*$/m);
    return errorMatch ? errorMatch[0] : null;
  };

  // Format the feedback text to remove error messages from the main content
  const formatFeedback = (text: string): string => {
    return text
      .replace(/Error:.*$/m, "")
      .replace(/Rating:.*$/m, "")
      .replace(/Score:.*$/m, "")
      .trim();
  };

  const getScoreColor = (score: number, isHuman: boolean = false) => {
    if (isHuman) {
      return score > 60 ? "text-green-500" : "text-yellow-500";
    }
    return score > 70 ? "text-red-500" : "text-yellow-500";
  };

  const getScoreBadge = (score: number, isHuman: boolean = false) => {
    if (isHuman) {
      return score > 60 ? "default" : "secondary";
    }
    return score > 70 ? "destructive" : "secondary";
  };

  const getProgressAnimation = () => {
    return "animate-[gradient_2s_linear_infinite] bg-[length:200%_100%]";
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to submit your feedback.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      const feedbackData = {
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        title: title,
        example_score: scores.examples || 0,
        approach_score: scores.approach || 0,
        testcase_score: scores.testCases || 0,
        code_score: scores.code || 0
      };

      console.log('Sending feedback data:', feedbackData);

      const response = await fetch('http://localhost:8000/api/feedback-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to save feedback data');
      }

      toast({
        title: "Success!",
        description: "Your feedback has been submitted successfully.",
        variant: "default",
      });

      onClose();
    } catch (error) {
      console.error('Error saving feedback data:', error);
      toast({
        title: "Error",
        description: "Failed to save feedback data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        {/* Question Details */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Solution Analysis & AI Detection
          </DialogTitle>
          <DialogDescription>
            Analysis of your solution and AI content detection results
          </DialogDescription>
        </DialogHeader>

        {/* AI Detection Results */}
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Content Analysis
          </h3>
          
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Analyzing content...</span>
                  <span className="text-sm text-muted-foreground animate-pulse">Please wait</span>
                </div>
                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-0 flex"
                  >
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-2 w-full bg-muted rounded" />
                </div>
                <div className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-2 w-full bg-muted rounded" />
                </div>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}. This could be due to:
                <ul className="list-disc ml-4 mt-2">
                  <li>Network connectivity issues</li>
                  <li>API service temporary unavailability</li>
                  <li>Rate limiting or invalid API key</li>
                </ul>
                The analysis will continue without AI detection results.
              </AlertDescription>
            </Alert>
          ) : aiDetection ? (
            <div className="space-y-4">
              {/* Approach Analysis Card */}
              <div className="border rounded-lg p-4 bg-card">
                <h4 className="text-lg font-semibold mb-4">Approach Analysis</h4>
                <div className="space-y-4">
                  {/* Score Badges */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Badge variant={getScoreBadge(aiDetection.approachScore.ai)} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {Math.round(aiDetection.approachScore.ai)}% AI Content
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {aiDetection.approachScore.ai > 70 ? 'High' : aiDetection.approachScore.ai > 40 ? 'Medium' : 'Low'} AI probability
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <Badge variant={getScoreBadge(aiDetection.approachScore.real, true)} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {Math.round(aiDetection.approachScore.real)}% Human Content
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {aiDetection.approachScore.real > 60 ? 'Mostly' : 'Partially'} human-written
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300" 
                          style={{ width: `${aiDetection.approachScore.real}%` }}
                        />
                        <div 
                          className="h-full bg-red-500 transition-all duration-300" 
                          style={{ width: `${aiDetection.approachScore.ai}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Human Content</span>
                      <span>AI Content</span>
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div className="mt-4 text-sm space-y-2">
                    <p className="font-medium">Content Analysis:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        <span className="text-green-600 dark:text-green-400">{Math.round(aiDetection.approachScore.real)}% human-written content</span>
                        {aiDetection.approachScore.real > 60 && " - Good level of originality"}
                      </li>
                      <li>
                        <span className="text-red-600 dark:text-red-400">{Math.round(aiDetection.approachScore.ai)}% AI-generated content</span>
                        {aiDetection.approachScore.ai > 70 && " - High AI influence detected"}
                      </li>
                      <li>
                        Overall: {aiDetection.approachScore.real > aiDetection.approachScore.ai ? 
                          "Predominantly human-written" : 
                          "Significant AI assistance detected"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Code Analysis Card */}
              <div className="border rounded-lg p-4 bg-card mt-4">
                <h4 className="text-lg font-semibold mb-4">Code Analysis</h4>
                <div className="space-y-4">
                  {/* Score Badges */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Badge variant={getScoreBadge(aiDetection.codeScore.ai)} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {Math.round(aiDetection.codeScore.ai)}% AI Code
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {aiDetection.codeScore.ai > 70 ? 'High' : aiDetection.codeScore.ai > 40 ? 'Medium' : 'Low'} AI probability
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <Badge variant={getScoreBadge(aiDetection.codeScore.real, true)} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {Math.round(aiDetection.codeScore.real)}% Human Code
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {aiDetection.codeScore.real > 60 ? 'Mostly' : 'Partially'} human-written
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300" 
                          style={{ width: `${aiDetection.codeScore.real}%` }}
                        />
                        <div 
                          className="h-full bg-red-500 transition-all duration-300" 
                          style={{ width: `${aiDetection.codeScore.ai}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Human Code</span>
                      <span>AI Code</span>
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div className="mt-4 text-sm space-y-2">
                    <p className="font-medium">Code Analysis:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>
                        <span className="text-green-600 dark:text-green-400">{Math.round(aiDetection.codeScore.real)}% human-written code</span>
                        {aiDetection.codeScore.real > 60 && " - Good level of originality"}
                      </li>
                      <li>
                        <span className="text-red-600 dark:text-red-400">{Math.round(aiDetection.codeScore.ai)}% AI-generated code</span>
                        {aiDetection.codeScore.ai > 70 && " - High AI influence detected"}
                      </li>
                      <li>
                        Overall: {aiDetection.codeScore.real > aiDetection.codeScore.ai ? 
                          "Predominantly human-written code" : 
                          "Significant AI assistance in code"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Overall Summary Alert */}
              {aiDetection.hasAIContent && (
                <Alert variant="destructive" className="mt-6 border-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">AI Content Detection Summary:</p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        This submission shows significant AI influence:
                      </p>
                      <ul className="list-disc ml-4 space-y-1 text-sm">
                        <li>
                          <span className="font-medium">Approach:</span> {Math.round(aiDetection.approachScore.ai)}% AI / {Math.round(aiDetection.approachScore.real)}% Human
                        </li>
                        <li>
                          <span className="font-medium">Code:</span> {Math.round(aiDetection.codeScore.ai)}% AI / {Math.round(aiDetection.codeScore.real)}% Human
                        </li>
                        <li>
                          <span className="font-medium">Overall Assessment:</span>{' '}
                          {((aiDetection.approachScore.ai + aiDetection.codeScore.ai) / 2) > 70 
                            ? 'Heavy reliance on AI-generated content'
                            : 'Moderate use of AI assistance'}
                        </li>
                      </ul>
                      <p className="text-sm mt-2">
                        Recommendation: {((aiDetection.approachScore.ai + aiDetection.codeScore.ai) / 2) > 70 
                          ? 'Consider reducing AI dependency and adding more original content.'
                          : 'Try to increase the proportion of original content in your submission.'}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to perform AI detection. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Overall Score */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Overall Score: {totalScore}%</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Examples</p>
              <p className="text-lg font-medium">{scores.examples}%</p>
              <p className={`text-sm font-medium ${getRatingColor(ratings.examples)}`}>
                {ratings.examples}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Approach</p>
              <p className="text-lg font-medium">{scores.approach}%</p>
              <p className={`text-sm font-medium ${getRatingColor(ratings.approach)}`}>
                {ratings.approach}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Test Cases</p>
              <p className="text-lg font-medium">{scores.testCases}%</p>
              <p className={`text-sm font-medium ${getRatingColor(ratings.testCases)}`}>
                {ratings.testCases}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Code</p>
              <p className="text-lg font-medium">{scores.code}%</p>
              <p className={`text-sm font-medium ${getRatingColor(ratings.code)}`}>
                {ratings.code}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-6">
          {/* Examples Analysis */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Examples Analysis</h3>
              {hasError(feedback.examples) ? (
                <AlertCircle className="text-destructive h-5 w-5" />
              ) : (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              )}
            </div>
            {hasError(feedback.examples) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getErrorMessage(feedback.examples)}
                </AlertDescription>
              </Alert>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{formatFeedback(feedback.examples)}</p>
            </div>
          </div>

          {/* Approach Analysis */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Approach Analysis</h3>
              {hasError(feedback.approach) ? (
                <AlertCircle className="text-destructive h-5 w-5" />
              ) : (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              )}
            </div>
            {hasError(feedback.approach) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getErrorMessage(feedback.approach)}
                </AlertDescription>
              </Alert>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{formatFeedback(feedback.approach)}</p>
            </div>
          </div>

          {/* Test Cases Analysis */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Test Cases Analysis</h3>
              {hasError(feedback.testCases) ? (
                <AlertCircle className="text-destructive h-5 w-5" />
              ) : (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              )}
            </div>
            {hasError(feedback.testCases) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getErrorMessage(feedback.testCases)}
                </AlertDescription>
              </Alert>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{formatFeedback(feedback.testCases)}</p>
            </div>
          </div>

          {/* Code Analysis */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Code Analysis</h3>
              {hasError(feedback.code) ? (
                <AlertCircle className="text-destructive h-5 w-5" />
              ) : (
                <CheckCircle2 className="text-green-500 h-5 w-5" />
              )}
            </div>
            {hasError(feedback.code) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getErrorMessage(feedback.code)}
                </AlertDescription>
              </Alert>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{formatFeedback(feedback.code)}</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
