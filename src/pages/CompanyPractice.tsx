import { Shield, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { PeerTopicProgress } from "@/components/PeerTopicProgress";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { companyQuestions } from "@/data/company_questions";

interface CompanyTopic {
  id: number;
  title: string;
  description: string;
  questions: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    timeLimit: number;
    tags: string[];
    companies: string[];
  }[];
}

export default function CompanyPractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topics] = useState<CompanyTopic[]>(companyQuestions);

  const handleTopicClick = (topic: CompanyTopic) => {
    navigate(`/company-practice/topic/${topic.id}`);
  };

  // Calculate overall progress
  const totalProgress = {
    completed: topics.reduce((sum, topic) => sum + topic.questions.length, 0),
    total: topics.reduce((sum, topic) => sum + topic.questions.length, 0),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Company-wise Practice Questions</h1>
          <p className="text-muted-foreground">
            Practice coding questions asked by top companies. Master data structures and algorithms.
          </p>
        </div>

        {/* Progress Overview */}
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

        {/* Topics Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">#</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Topic</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">Questions</th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, index) => (
                <tr
                  key={topic.id}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{topic.title}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{topic.description}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                    <div className="flex flex-col items-center">
                      <span>{topic.questions.length} Questions</span>
                      <PeerTopicProgress
                        completed={0}
                        total={topic.questions.length}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                    <Button
                      onClick={() => handleTopicClick(topic)}
                      variant="default"
                      className="w-full"
                    >
                      View Questions
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
