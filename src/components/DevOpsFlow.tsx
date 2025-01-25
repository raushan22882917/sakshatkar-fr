import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronDown, 
  GitBranch, 
  Box, 
  Cpu,
  Server,
  Cloud,
  Lock,
  Terminal,
  Settings,
  Monitor
} from "lucide-react";

interface TopicNode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  subtopics: SubTopic[];
  progress: number;
}

interface SubTopic {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

const topics: TopicNode[] = [
  {
    id: '1',
    title: 'Version Control (Git)',
    description: 'Master Git fundamentals and advanced workflows',
    icon: GitBranch,
    color: 'blue',
    progress: 0,
    subtopics: [
      {
        id: '1-1',
        title: 'Git Basics',
        description: 'Learn essential Git commands and workflows',
        duration: '2 hours',
        difficulty: 'Beginner',
        tags: ['git', 'version-control', 'basics']
      },
      {
        id: '1-2',
        title: 'Branching & Merging',
        description: 'Master branch management and merge strategies',
        duration: '3 hours',
        difficulty: 'Intermediate',
        tags: ['git', 'branching', 'merging']
      },
      {
        id: '1-3',
        title: 'Advanced Git',
        description: 'Advanced topics like rebasing and cherry-picking',
        duration: '4 hours',
        difficulty: 'Advanced',
        tags: ['git', 'advanced', 'rebase']
      }
    ]
  },
  {
    id: '2',
    title: 'CI/CD Pipelines',
    description: 'Build robust continuous integration and deployment pipelines',
    icon: Box,
    color: 'green',
    progress: 0,
    subtopics: [
      {
        id: '2-1',
        title: 'Jenkins Fundamentals',
        description: 'Learn Jenkins pipeline configuration and automation',
        duration: '4 hours',
        difficulty: 'Intermediate',
        tags: ['jenkins', 'ci-cd', 'automation']
      },
      {
        id: '2-2',
        title: 'GitHub Actions',
        description: 'Create automated workflows with GitHub Actions',
        duration: '3 hours',
        difficulty: 'Intermediate',
        tags: ['github', 'actions', 'ci-cd']
      },
      {
        id: '2-3',
        title: 'GitLab CI',
        description: 'Master GitLab CI/CD pipelines and runners',
        duration: '4 hours',
        difficulty: 'Advanced',
        tags: ['gitlab', 'ci-cd', 'pipelines']
      }
    ]
  },
  {
    id: '3',
    title: 'Containerization',
    description: 'Learn Docker and container orchestration',
    icon: Server,
    color: 'purple',
    progress: 0,
    subtopics: [
      {
        id: '3-1',
        title: 'Docker Fundamentals',
        description: 'Master Docker basics and container management',
        duration: '3 hours',
        difficulty: 'Beginner',
        tags: ['docker', 'containers', 'basics']
      },
      {
        id: '3-2',
        title: 'Docker Compose',
        description: 'Build and manage multi-container applications',
        duration: '3 hours',
        difficulty: 'Intermediate',
        tags: ['docker', 'compose', 'multi-container']
      },
      {
        id: '3-3',
        title: 'Container Security',
        description: 'Learn best practices for securing containers',
        duration: '4 hours',
        difficulty: 'Advanced',
        tags: ['docker', 'security', 'best-practices']
      }
    ]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-800';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'Advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DevOpsFlow = () => {
  const navigate = useNavigate();

  const handleTopicClick = (topicId: string) => {
    navigate(`/devops-practice/${topicId}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-12">
      {topics.map((topic, index) => (
        <div key={topic.id} className="space-y-6">
          {/* Main Topic Card */}
          <Card 
            className={`hover:shadow-xl transition-all duration-300 border-l-4 border-${topic.color}-500 group`}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-${topic.color}-100 group-hover:bg-${topic.color}-200 transition-colors`}>
                  <topic.icon className={`w-6 h-6 text-${topic.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">{topic.title}</CardTitle>
                  <CardDescription className="text-base">{topic.description}</CardDescription>
                </div>
              </div>
              <Progress value={topic.progress} className="w-32" />
            </CardHeader>
          </Card>

          {/* Subtopics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-12 relative">
            {/* Vertical Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-${topic.color}-200`} />

            {topic.subtopics.map((subtopic, subIndex) => (
              <Card 
                key={subtopic.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleTopicClick(subtopic.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getDifficultyColor(subtopic.difficulty)}>
                      {subtopic.difficulty}
                    </Badge>
                    <Badge variant="outline">{subtopic.duration}</Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {subtopic.title}
                  </CardTitle>
                  <CardDescription>{subtopic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subtopic.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connection arrow */}
          {index < topics.length - 1 && (
            <div className="flex justify-center py-4">
              <div className={`p-2 rounded-full bg-${topic.color}-100`}>
                <ChevronDown className={`w-6 h-6 text-${topic.color}-600`} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DevOpsFlow;
