import { Progress } from "@/components/ui/progress";

interface PeerTopicProgressProps {
  completed: number;
  total: number;
}

export function PeerTopicProgress({ completed, total }: PeerTopicProgressProps) {
  const percentage = (completed / total) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-2">
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}