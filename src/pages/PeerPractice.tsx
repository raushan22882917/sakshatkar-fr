import { Shield, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PeerTopicProgress } from "@/components/PeerTopicProgress";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface peerTopic {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  unlocked: boolean;
  achievement: string;
  status: 'locked' | 'in_progress' | 'completed';
}

const initialpeerTopics: peerTopic[] = [
  {
    id: 1,
    title: "Arrays",
    description: "Learn about arrays and basic operations",
    totalQuestions: 5,
    completedQuestions: 0,
    unlocked: true,
    achievement: "Array Master",
    status: 'in_progress'
  },
  {
    id: 2,
    title: "Linked Lists",
    description: "Understanding linked lists and their operations",
    totalQuestions: 5,
    completedQuestions: 0,
    unlocked: false,
    achievement: "List Navigator",
    status: 'locked'
  },
  {
    id: 3,
    title: "Stacks",
    description: "Master stack operations and applications",
    totalQuestions: 6,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Stack Specialist",
    status: 'locked'
  },
  {
    id: 4,
    title: "Queues",
    description: "Learn about queues and their variants",
    totalQuestions: 4,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Queue Commander",
    status: 'locked'
  },
  {
    id: 5,
    title: "Trees",
    description: "Dive into trees, traversals, and binary trees",
    totalQuestions: 8,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Tree Climber",
    status: 'locked'
  },
  {
    id: 6,
    title: "Graphs",
    description: "Understand graph theory and algorithms",
    totalQuestions: 10,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Graph Explorer",
    status: 'locked'
  },
  {
    id: 7,
    title: "Hashing",
    description: "Learn hashing techniques and applications",
    totalQuestions: 5,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Hash Hero",
    status: 'locked'
  },
  {
    id: 8,
    title: "Dynamic Programming",
    description: "Solve problems with dynamic programming",
    totalQuestions: 12,
    completedQuestions: 0,
    unlocked: false,
    achievement: "DP Expert",
    status: 'locked'
  },
  {
    id: 9,
    title: "Sorting Algorithms",
    description: "Master sorting algorithms like quicksort and mergesort",
    totalQuestions: 7,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Sorting Prodigy",
    status: 'locked'
  },
  {
    id: 10,
    title: "Greedy Algorithms",
    description: "Learn and apply greedy techniques",
    totalQuestions: 5,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Greedy Genius",
    status: 'locked'
  },
  {
    id: 11,
    title: "Recursion",
    description: "Deep dive into recursion concepts and problems",
    totalQuestions: 6,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Recursion Wizard",
    status: 'locked'
  },
  {
    id: 12,
    title: "Bit Manipulation",
    description: "Understand bitwise operations and applications",
    totalQuestions: 4,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Bit Master",
    status: 'locked'
  },
  {
    id: 13,
    title: "Backtracking",
    description: "Solve complex problems using backtracking",
    totalQuestions: 6,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Backtracking Champion",
    status: 'locked'
  },
  {
    id: 14,
    title: "Divide and Conquer",
    description: "Learn the divide and conquer approach",
    totalQuestions: 5,
    completedQuestions: 0,
    unlocked: false,
    achievement: "Divide & Conquer Specialist",
    status: 'locked'
  },
  {
    id: 15,
    title: "String Algorithms",
    description: "Work on string manipulation and pattern matching",
    totalQuestions: 8,
    completedQuestions: 0,
    unlocked: false,
    achievement: "String Maestro",
    status: 'locked'
  },
];

export default function PeerPractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [peerTopics, setpeerTopics] = useState<peerTopic[]>(initialpeerTopics);

  const handlepeerTopicClick = (peerTopic: peerTopic) => {
    if (!peerTopic.unlocked) {
      toast({
        title: "Topic Locked",
        description: "Complete the previous topic to unlock this one!",
        variant: "destructive",
      });
      return;
    }

    navigate(`/peer-practice/topic/${peerTopic.id}`);
  };

  const totalProgress = {
    completed: peerTopics.reduce((sum, peerTopic) => sum + peerTopic.completedQuestions, 0),
    total: peerTopics.reduce((sum, peerTopic) => sum + peerTopic.totalQuestions, 0),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Data Structures Learning Path</h1>
          <p className="text-muted-foreground">
            Master data structures step by step. Complete each topic to unlock the next one.
          </p>
        </div>

        <div className="flex justify-center items-center py-6">
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-gray-300 dark:text-gray-600"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="282.6"
                strokeDashoffset={
                  282.6 - (282.6 * totalProgress.completed) / totalProgress.total
                }
                className="text-primary transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">
                {Math.round((totalProgress.completed / totalProgress.total) * 100)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {totalProgress.completed}/{totalProgress.total} Questions
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">#</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Topic</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">Progress</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">Status</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {peerTopics.map((peerTopic, index) => (
                <tr
                  key={peerTopic.id}
                  className={`${
                    peerTopic.unlocked ? "hover:bg-gray-200 dark:hover:bg-gray-700" : "opacity-60"
                  }`}
                >
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{peerTopic.title}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{peerTopic.description}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                    <div className="flex flex-col items-center">
                      <span>{peerTopic.completedQuestions}/{peerTopic.totalQuestions}</span>
                      <PeerTopicProgress
                        completed={peerTopic.completedQuestions}
                        total={peerTopic.totalQuestions}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                    {peerTopic.unlocked ? (
                      peerTopic.completedQuestions === peerTopic.totalQuestions ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          <Check className="w-4 h-4 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-500">
                          <Shield className="w-4 h-4 mr-1" />
                          In Progress
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Lock className="w-4 h-4 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                    <Button
                      onClick={() => handlepeerTopicClick(peerTopic)}
                      disabled={!peerTopic.unlocked}
                      variant={peerTopic.unlocked ? "default" : "outline"}
                      className="w-full"
                    >
                      {peerTopic.unlocked ? "Solve Challenge" : "Locked"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
