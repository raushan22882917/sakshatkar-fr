import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, BookOpen, Code, Brain } from "lucide-react";

const labs = [
  {
    id: 1,
    title: "Python Fundamentals",
    description: "Learn the basics of Python programming",
    modules: [
      "Variables and Data Types",
      "Control Flow",
      "Functions",
      "Object-Oriented Programming"
    ],
    progress: 0,
    icon: Code
  },
  {
    id: 2,
    title: "Data Structures",
    description: "Master common data structures",
    modules: [
      "Arrays and Lists",
      "Stacks and Queues",
      "Trees",
      "Graphs"
    ],
    progress: 0,
    icon: Brain
  },
  {
    id: 3,
    title: "Algorithms",
    description: "Learn essential algorithms",
    modules: [
      "Sorting Algorithms",
      "Searching Algorithms",
      "Dynamic Programming",
      "Graph Algorithms"
    ],
    progress: 0,
    icon: BookOpen
  }
];

const LabsSection: React.FC = () => {
  return (
    <div className="space-y-4">
      {labs.map((lab) => (
        <Card key={lab.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <lab.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{lab.title}</h3>
                <Badge variant="outline">{lab.modules.length} modules</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {lab.description}
              </p>
              <Progress value={lab.progress} className="mt-2" />
              <div className="mt-4 space-y-2">
                {lab.modules.map((module, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between"
                  >
                    <span className="text-sm">{module}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LabsSection;
