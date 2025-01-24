import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code, Brain, Cpu } from "lucide-react";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {labs.map((lab) => {
        const Icon = lab.icon;
        return (
          <Card key={lab.id} className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{lab.title}</h3>
                  <Badge variant="outline">{lab.modules.length} modules</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {lab.description}
                </p>
                <Progress value={lab.progress} className="mb-4" />
                <div className="space-y-2">
                  {lab.modules.map((module, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground p-2 rounded-lg bg-secondary/10"
                    >
                      {module}
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => navigate(lab.route)}
                >
                  Start Learning
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default LabsSection;