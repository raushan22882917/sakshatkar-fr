import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiOutlineClockCircle, AiOutlineTeam } from "react-icons/ai";
import { Contest } from "@/types/contest";
import { useNavigate } from "react-router-dom";

interface ContestCardProps {
  contest: Contest;
  bgColor?: string;
}

export function ContestCard({ contest, bgColor = "from-blue-600 to-blue-800" }: ContestCardProps) {
  const navigate = useNavigate();

  const getTimeRemaining = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `Starts in ${days} days`;
    } else if (now >= start && now <= end) {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return `${hours} hours remaining`;
    }
    return "Ended";
  };

  return (
    <div
      className={`bg-gradient-to-br ${bgColor} p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300`}
      onClick={() => navigate(`/contests/${contest.id}`)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-white">{contest.title}</span>
        <Badge variant="outline" className="bg-white/10">
          {contest.status?.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/80">
        <AiOutlineClockCircle />
        <span>{getTimeRemaining(contest.start_time, contest.end_time)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
        <AiOutlineTeam />
        <span>{contest.participant_count} participants</span>
      </div>
    </div>
  );
}