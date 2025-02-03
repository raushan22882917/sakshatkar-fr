import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiOutlineClockCircle, AiOutlineTeam, AiOutlineTrophy } from "react-icons/ai";
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
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `Starts in ${days}d ${hours}h`;
    } else if (now >= start && now <= end) {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }
    return "Ended";
  };

  return (
    <Card 
      className={`bg-gradient-to-br ${bgColor} hover:scale-105 transition-all duration-300 cursor-pointer border-0`}
      onClick={() => navigate(`/contests/${contest.id}`)}
    >
      <div className="p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg">{contest.title}</h3>
          <Badge variant="outline" className="bg-white/10">
            {contest.status?.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <AiOutlineClockCircle className="h-4 w-4" />
            <span>{getTimeRemaining(contest.start_time, contest.end_time)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/80">
            <AiOutlineTeam className="h-4 w-4" />
            <span>{contest.participant_count || 0} participants</span>
          </div>

          {contest.problems && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <AiOutlineTrophy className="h-4 w-4" />
              <span>{contest.problems.length} problems</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}