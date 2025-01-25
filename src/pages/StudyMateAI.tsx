import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Code2, BookOpen, GraduationCap, FlaskConical, Info } from "lucide-react";

const learningPaths = [
  {
    title: "Python",
    description: "Master Python programming fundamentals and best practices.",
    icon: Code2,
    image: "https://via.placeholder.com/300x200?text=Python+Learning",
    route: "/learn/python",
  },
  {
    title: "DSA Basic",
    description: "Learn fundamental data structures and algorithms.",
    icon: Brain,
    image: "https://via.placeholder.com/300x200?text=DSA+Basic",
    route: "/learn/dsa-basic",
  },
  {
    title: "DSA Intermediate",
    description: "Advance your DSA knowledge with complex problems.",
    icon: BookOpen,
    image: "https://via.placeholder.com/300x200?text=DSA+Intermediate",
    route: "/learn/dsa-intermediate",
  },
  {
    title: "DSA Advanced",
    description: "Master advanced algorithms and optimization techniques.",
    icon: GraduationCap,
    image: "https://via.placeholder.com/300x200?text=DSA+Advanced",
    route: "/learn/dsa-advanced",
  },
];

const upcomingLabs = [
  {
    title: "AI-Powered Web Development",
    description: "Learn to build modern, AI-integrated web applications.",
    icon: FlaskConical,
    image: "https://via.placeholder.com/300x200?text=AI+Web+Development",
  },
  {
    title: "Cloud Computing Essentials",
    description: "Understand the basics of cloud platforms and infrastructure.",
    icon: Brain,
    image: "https://via.placeholder.com/300x200?text=Cloud+Computing",
  },
  {
    title: "DevOps Fundamentals",
    description: "Get hands-on experience with CI/CD pipelines and DevOps tools.",
    icon: Code2,
    image: "https://via.placeholder.com/300x200?text=DevOps+Fundamentals",
  },
  {
    title: "Advanced AI Algorithms",
    description: "Explore advanced AI concepts like transformers and GANs.",
    icon: FlaskConical,
    image: "https://via.placeholder.com/300x200?text=Advanced+AI+Algorithms",
  },
];

export default function StudyMateAI() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">StudyMate AI</h1>
        <p className="text-lg text-muted-foreground">
          Learn, grow, and excel in coding with personalized guidance from AI. Explore our learning paths and prepare for the future of technology.
        </p>
      </div>

      {/* Instructions Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">How to Use StudyMate AI</h2>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Quick Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Explore <strong>Learning Paths</strong> to choose a topic you want to master.</li>
              <li>Visit <strong>Upcoming Labs</strong> to see the latest features and hands-on experiments.</li>
              <li>Track your progress in each section and revisit lessons anytime.</li>
              <li>Use the built-in AI assistant to ask coding questions or debug your code.</li>
              <li>Bookmark important resources for quick access in the future.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningPaths.map((path) => {
            const Icon = path.icon;
            return (
              <Card
                key={path.title}
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(path.route)}
              >
                <img
                  src={path.image}
                  alt={`${path.title} Cover`}
                  className="rounded-t-lg object-cover w-full h-32"
                />
                <CardHeader>
                  <div className="flex items-center space-x-2 mt-4">
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

      {/* Upcoming Labs Section */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Labs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingLabs.map((lab, index) => {
            const Icon = lab.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={lab.image}
                  alt={`${lab.title} Cover`}
                  className="rounded-t-lg object-cover w-full h-32"
                />
                <CardHeader>
                  <div className="flex items-center space-x-2 mt-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{lab.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{lab.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
