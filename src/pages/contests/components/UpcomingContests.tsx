import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiOutlineTrophy } from "react-icons/ai";
import { Contest } from "@/types/contest";
import { useNavigate } from "react-router-dom";

interface UpcomingContestsProps {
  contests: Contest[];
}

export function UpcomingContests({ contests }: UpcomingContestsProps) {
  const navigate = useNavigate();
  
  const getTimeRemaining = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `Starts in ${days} days`;
    }
    return "Started";
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8 text-center text-white">Upcoming Contests</h2>
      <div className="grid gap-6">
        {contests
          .filter(contest => new Date(contest.start_time) > new Date())
          .map((contest) => (
            <Card
              key={contest.id}
              className="p-6 bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
              onClick={() => navigate(`/contests/${contest.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">{contest.title}</h3>
                  <p className="text-gray-400">{contest.description}</p>
                </div>
                <div className="text-right">
                  <Badge className="mb-2">
                    {getTimeRemaining(contest.start_time, contest.end_time)}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <AiOutlineTrophy className="text-yellow-500" />
                    <span>{contest.coding_problems?.length || 0} problems</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}