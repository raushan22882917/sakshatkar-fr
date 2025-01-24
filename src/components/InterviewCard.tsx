import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface InterviewCardProps {
  title: string;
  company: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
}

export const InterviewCard = ({ title, company, date, time, status }: InterviewCardProps) => {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <Card className="glass-card hover:scale-[1.02] transition-transform duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{company}</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};