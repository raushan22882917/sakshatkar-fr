import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";

export interface QuestionTimerProps {
  duration?: number;
  onTimeUpdate: (time: number) => void;
}

export function QuestionTimer({ duration = 300, onTimeUpdate }: QuestionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = (timeLeft / duration) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onTimeUpdate]);

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-center">
        Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </p>
    </div>
  );
}