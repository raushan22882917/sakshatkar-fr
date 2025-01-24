import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  response?: string;
  score?: number;
  feedback?: string;
}

interface InterviewResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  companyName: string;
  position: string;
}

export function InterviewResultsDialog({
  open,
  onOpenChange,
  questions,
  companyName,
  position,
}: InterviewResultsDialogProps) {
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

  const getTotalScore = () => {
    return questions.reduce((total, q) => total + (q.score || 0), 0);
  };

  const handleSubmit = async () => {
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
        total_score: totalScore,
        interview_date: new Date().toISOString(),
        questions: questions.map(q => ({
          question_text: q.question,
          answer_text: q.response || '',
          score: q.score || 0,
          feedback: q.feedback || ''
        }))
      };

      console.log('Sending data:', interviewData);

      const response = await fetch('http://localhost:8000/api/hr-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to save interview data');
      }

      toast({
        title: "Success!",
        description: "Your HR interview results have been submitted successfully.",
        variant: "default",
      });

      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">HR Interview Results</DialogTitle>
          <DialogDescription>
            Review your interview responses and scores
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-600">{question.question}</p>
                    </div>
                    {question.score !== undefined && (
                      <Badge variant="secondary" className="text-lg">
                        Score: {question.score}/10
                      </Badge>
                    )}
                  </div>

                  {question.response && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Your Response</h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {question.response}
                      </p>
                    </div>
                  )}

                  {question.feedback && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Feedback</h4>
                      <p className="text-gray-600">{question.feedback}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {/* Total Score Section */}
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Total Score</h3>
                <Badge variant="secondary" className="text-xl">
                  {getTotalScore()}/{questions.length * 10}
                </Badge>
              </div>
            </Card>
          </div>
        </ScrollArea>

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
                Submit HR Interview Results
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
