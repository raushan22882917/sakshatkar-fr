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
    icon: <Code className="h-6 w-6" />,
    progress: 0,
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
    icon: <Brain className="h-6 w-6" />,
    progress: 0,
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
    icon: <Cpu className="h-6 w-6" />,
    progress: 0,
    modules: [
      "Trees and Binary Trees",
      "Graphs and Graph Algorithms",
      "Advanced Sorting",
      "Dynamic Programming",
      "Greedy Algorithms",
      "Backtracking"
    ]
  },
  {
    id: "dsa-advanced",
    title: "DSA Advanced",
    description: "Master complex algorithms and optimization techniques",
    icon: <BookOpen className="h-6 w-6" />,
    progress: 0,
    modules: [
      "Advanced Data Structures",
      "Network Flow Algorithms",
      "String Algorithms",
      "Computational Geometry",
      "NP-Complete Problems",
      "Approximation Algorithms"
    ]
  }
];

const LabsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleLabClick = (labId: string) => {
    navigate(`/studymate-ai?lab=${labId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
      {labs.map((lab) => (
        <Card 
          key={lab.id}
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleLabClick(lab.id)}
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              {lab.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{lab.title}</h3>
                <Badge variant="secondary">{lab.modules.length} modules</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{lab.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{lab.progress}%</span>
                </div>
                <Progress value={lab.progress} className="h-2" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LabsSection;