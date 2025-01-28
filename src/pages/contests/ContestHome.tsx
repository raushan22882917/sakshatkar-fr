import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AiOutlineTrophy,
  AiOutlineClockCircle,
  AiOutlineDollar,
  AiOutlineCalendar,
} from "react-icons/ai";
import type { Contest } from "@/types/contest";

export default function ContestHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from("coding_contests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const contestTypes = [
    {
      title: "Weekly Contest",
      icon: "🏆",
      prize: "$500",
      schedule: "Every Monday",
      theme: "Algorithms",
      timeLeft: "02:34:56",
      bgColor: "from-blue-600 to-blue-800",
    },
    {
      title: "Bi-Weekly Contest",
      icon: "🥇",
      prize: "$1000",
      schedule: "Every Other Wednesday",
      theme: "Data Structures",
      timeLeft: "05:12:34",
      bgColor: "from-indigo-600 to-indigo-800",
    },
    {
      title: "Monthly Contest",
      icon: "👑",
      prize: "$2000",
      schedule: "First Saturday of the Month",
      theme: "Web Development",
      timeLeft: "10:45:12",
      bgColor: "from-purple-600 to-purple-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Coding Contest Platform
          </h1>
          <p className="text-gray-400 text-lg">
            Join the competition and showcase your skills!
          </p>
        </div>

        {/* Contest Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {contestTypes.map((contest, index) => (
            <Card
              key={index}
              className={`p-6 bg-gradient-to-br ${contest.bgColor} border-0 hover:scale-105 transition-transform duration-300 text-white`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{contest.icon}</span>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    Active
                  </Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">{contest.title}</h3>
                <div className="space-y-3 mb-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <AiOutlineDollar className="text-white/80" />
                    <span>Prize Pool: {contest.prize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AiOutlineCalendar className="text-white/80" />
                    <span>{contest.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AiOutlineTrophy className="text-white/80" />
                    <span>Theme: {contest.theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AiOutlineClockCircle className="text-white/80" />
                    <span>Time Left: {contest.timeLeft}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Join the Contest!</h2>
            <p className="text-gray-400 mb-6">Sign up now to start competing!</p>
            <Button
              onClick={() => navigate("/contest/list")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}