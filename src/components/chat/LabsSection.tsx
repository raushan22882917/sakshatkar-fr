import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code, Brain, Cpu } from "lucide-react";
import topicsData from '../../data/topics.json';

const labs = [
  {
    id: 1,
    title: "Python Fundamentals",
    description: "Master Python programming from basics to advanced concepts",
    route: "/learn/python",
    progress: 0,
    icon: Code,
    modules: [
      "Variables and Data Types",
      "Control Flow",
      "Functions",
      "Object-Oriented Programming",
      "File Handling",
      "Error Handling"
    ]
  },
  {
    id: 2,
    title: "DSA Basic",
    description: "Learn fundamental data structures and algorithms",
    route: "/learn/dsa-basic",
    progress: 0,
    icon: Brain,
    modules: [
      "Arrays and Lists",
      "Stacks and Queues",
      "Linked Lists",
      "Basic Sorting",
      "Basic Searching",
      "Time Complexity"
    ]
  },
  {
    id: 3,
    title: "DSA Intermediate",
    description: "Advance your DSA knowledge with complex problems",
    route: "/learn/dsa-intermediate",
    progress: 0,
    icon: BookOpen,
    modules: [
      "Trees and Binary Trees",
      "Hash Tables",
      "Advanced Sorting",
      "Graph Basics",
      "Dynamic Programming Intro",
      "Greedy Algorithms"
    ]
  },
  {
    id: 4,
    title: "DSA Advanced",
    description: "Master advanced algorithms and optimization techniques",
    route: "/learn/dsa-advanced",
    progress: 0,
    icon: Cpu,
    modules: [
      "Advanced Graph Algorithms",
      "Advanced Dynamic Programming",
      "String Algorithms",
      "Network Flow",
      "NP-Complete Problems",
      "Optimization Techniques"
    ]
  }
];

const LabsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (topicId: string) => {
    navigate(`/chat/${topicId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Object.values(topicsData).map((topic) => (
        <div
          key={topic.id}
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleCardClick(topic.id)}
        >
          <h3 className="text-xl font-semibold mb-4">{topic.title}</h3>
          <div className="text-gray-600">
            <p className="mb-2">Subtopics:</p>
            <ul className="list-disc pl-5">
              {topic.subtopics.slice(0, 3).map((subtopic) => (
                <li key={subtopic.id}>{subtopic.title}</li>
              ))}
              {topic.subtopics.length > 3 && (
                <li className="text-blue-500">+ {topic.subtopics.length - 3} more...</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LabsSection;