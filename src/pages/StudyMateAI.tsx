import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Code2, BookOpen, GraduationCap } from "lucide-react";

const learningPaths = [
  {
    title: "Python",
    description: "Master Python programming fundamentals and best practices",
    icon: Code2,
    route: "/learn/python"
  },
  {
    title: "DSA Basic",
    description: "Learn fundamental data structures and algorithms",
    icon: Brain,
    route: "/learn/dsa-basic"
  },
  {
    title: "DSA Intermediate",
    description: "Advance your DSA knowledge with complex problems",
    icon: BookOpen,
    route: "/learn/dsa-intermediate"
  },
  {
    title: "DSA Advanced",
    description: "Master advanced algorithms and optimization techniques",
    icon: GraduationCap,
    route: "/learn/dsa-advanced"
  }
];

export default function StudyMateAI() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">StudyMate AI Learning Paths</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {learningPaths.map((path) => {
          const Icon = path.icon;
          return (
            <Card 
              key={path.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(path.route)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{path.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}