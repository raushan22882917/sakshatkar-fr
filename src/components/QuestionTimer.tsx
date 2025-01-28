import React, { useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

export interface QuestionTimerProps {
  duration: number;
  onTimeUpdate: (time: number) => void;
  maxTime: number;
}

export function QuestionTimer({ duration, onTimeUpdate, maxTime }: QuestionTimerProps) {
  const progress = (duration / maxTime) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      onTimeUpdate(duration - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUpdate]);

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-center">
        Time remaining: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </p>
    </div>
  );
}