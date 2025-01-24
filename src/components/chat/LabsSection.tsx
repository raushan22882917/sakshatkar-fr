import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code, Brain, Cpu } from "lucide-react";

const labs = [
  {
    id: "python",
    title: "Python Fundamentals",
    description: "Master Python programming from basics to advanced concepts",
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
    id: "dsa-basic",
    title: "DSA Basic",
    description: "Learn fundamental data structures and algorithms",
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
    id: "dsa-intermediate",
    title: "DSA Intermediate",
    description: "Advance your DSA knowledge with complex problems",
    modules: [
      "Trees and Binary Trees",
      "Graphs and Graph Algorithms",
      "Advanced Sorting",
      "Dynamic Programming",
      "Greedy Algorithms",
      "Backtracking"
    ]
  }
];

const LabsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (labId: string) => {
    navigate(`/chat/${labId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {labs.map((lab) => (
        <div
          key={lab.id}
          className=" rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleCardClick(lab.id)}
        >
          <h3 className="text-xl font-semibold mb-4">{lab.title}</h3>
          <div className="text-gray-600">
            <p className="mb-2">Modules:</p>
            <ul className="list-disc pl-5">
              {lab.modules.slice(0, 3).map((module, index) => (
                <li key={index} className="text-sm">{module}</li>
              ))}
              {lab.modules.length > 3 && (
                <li className="text-blue-500 text-sm">+ {lab.modules.length - 3} more...</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LabsSection;