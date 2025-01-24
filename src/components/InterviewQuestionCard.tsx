import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';

interface InterviewQuestionCardProps {
  question: string;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function InterviewQuestionCard({
  question,
  isRecording,
  onStartRecording,
  onStopRecording,
}: InterviewQuestionCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <p className="text-lg mb-6">{question}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? onStopRecording : onStartRecording}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}