import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Volume2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  correctAnswer: string;
}

export function AIDialog({ isOpen, onClose, question, correctAnswer }: AIDialogProps) {
  const [isListening, setIsListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setUserAnswer(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    if (!isListening) {
      recognition.start();
      setIsListening(true);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const getFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interviewer. Analyze the user\'s answer and provide constructive feedback.'
            },
            {
              role: 'user',
              content: `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser's Answer: ${userAnswer}\n\nPlease provide feedback on the user's answer, highlighting what was good and what could be improved. Be constructive and encouraging.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      setFeedback(data.choices[0].message.content);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Error getting feedback. Please try again.');
    }
    setIsLoading(false);
  };

  const speakFeedback = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Practice Answer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Question:</h3>
            <p>{question}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Answer:</h3>
              <Button
                size="sm"
                variant={isListening ? "destructive" : "secondary"}
                onClick={toggleListening}
              >
                {isListening ? <StopCircle className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isListening ? "Stop Recording" : "Start Recording"}
              </Button>
            </div>
            <Textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type or speak your answer..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={getFeedback} 
            disabled={!userAnswer || isLoading}
            className="w-full"
          >
            Get AI Feedback
          </Button>

          {feedback && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Feedback:</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={speakFeedback}
                  disabled={isSpeaking}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {isSpeaking ? "Speaking..." : "Listen"}
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{feedback}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
