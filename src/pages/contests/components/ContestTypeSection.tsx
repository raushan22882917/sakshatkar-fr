import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiOutlineCalendar } from "react-icons/ai";
import { Contest } from "@/types/contest";
import { ContestCard } from "./ContestCard";

interface ContestTypeSectionProps {
  title: string;
  schedule: string;
  bgColor: string;
  contests: Contest[];
}

export function ContestTypeSection({ title, schedule, bgColor, contests }: ContestTypeSectionProps) {
  return (
    <Card className={`p-6 bg-gradient-to-br ${bgColor} border-0 text-white`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <Badge variant="secondary" className="bg-white/10">
            {contests.length} Active
          </Badge>
        </div>
        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex items-center gap-2">
            <AiOutlineCalendar className="text-white/80" />
            <span>{schedule}</span>
          </div>
          {contests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} bgColor={bgColor} />
          ))}
        </div>
      </div>
    </Card>
  );
}