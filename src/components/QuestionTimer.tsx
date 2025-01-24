import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface QuestionTimerProps {
  timeSpent: number;
  maxTime: number;
}

export function QuestionTimer({ timeSpent, maxTime }: QuestionTimerProps) {
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeSpent / maxTime) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm font-medium">
        {formatTime(timeSpent)} / {formatTime(maxTime)}
      </div>
      <Progress value={progressPercentage} className="w-24" />
    </div>
  );
}