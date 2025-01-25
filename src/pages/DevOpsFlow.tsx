import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import {
  Code,
  GitBranch,
  Container,
  Cloud,
  Monitor,
  Settings,
  Server,
  Lock,
  Repeat,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Database,
  Terminal,
  Globe,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SubTopic {
  title: string;
  description: string;
  tools?: string[];
  concepts?: string[];
  image?: string;
  nextSteps?: string[];
}

interface DevOpsTopic {
  id: string;
  title: string;
  icon: any;
  description: string;
  phase: number;
  category: "foundation" | "development" | "operations" | "advanced";
  subtopics: SubTopic[];
}

const devopsTopics: DevOpsTopic[] = [
  // Foundation Phase
  {
    id: "basics",
    title: "Programming Fundamentals",
    icon: Code,
    phase: 1,
    category: "foundation",
    description: "Master core programming concepts",
    subtopics: [
      {
        title: "Python Essentials",
        description: "Start with Python programming",
        concepts: ["Variables", "Functions", "OOP", "Data Structures"],
        nextSteps: ["Version Control", "Shell Scripting"],
        image: "https://www.python.org/static/img/python-logo.png",
      },
      {
        title: "Shell Scripting",
        description: "Learn command-line automation",
        concepts: ["Bash", "Shell Commands", "Automation"],
        nextSteps: ["Linux Systems", "Automation"],
        image: "https://bashlogo.com/img/symbol/png/full_colored_dark.png",
      },
    ],
  },
  {
    id: "version-control",
    title: "Version Control",
    icon: GitBranch,
    phase: 1,
    category: "foundation",
    description: "Learn Git and collaboration",
    subtopics: [
      {
        title: "Git Fundamentals",
        description: "Master Git basics and workflow",
        concepts: ["Commits", "Branches", "Merging", "Pull Requests"],
        nextSteps: ["CI/CD Basics", "Team Collaboration"],
        image: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
      },
    ],
  },
  // Development Phase
  {
    id: "cicd",
    title: "CI/CD Pipeline",
    icon: Repeat,
    phase: 2,
    category: "development",
    description: "Continuous Integration/Delivery",
    subtopics: [
      {
        title: "CI Fundamentals",
        description: "Build automation and testing",
        concepts: ["Build Process", "Unit Testing", "Integration Testing"],
        nextSteps: ["Containerization", "Deployment Strategies"],
        image: "https://about.gitlab.com/images/press/logo/png/gitlab-logo-500.png",
      },
      {
        title: "CD Practices",
        description: "Deployment automation",
        concepts: ["Deployment Pipeline", "Release Management", "Rollbacks"],
        nextSteps: ["Container Orchestration", "Cloud Deployment"],
        image: "https://www.jenkins.io/images/logo-title-opengraph.png",
      },
    ],
  },
  // Operations Phase
  {
    id: "containers",
    title: "Containerization",
    icon: Container,
    phase: 3,
    category: "operations",
    description: "Container tech and orchestration",
    subtopics: [
      {
        title: "Docker",
        description: "Container basics and management",
        concepts: ["Images", "Containers", "Networks", "Volumes"],
        nextSteps: ["Kubernetes", "Cloud Services"],
        image: "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png",
      },
      {
        title: "Kubernetes",
        description: "Container orchestration",
        concepts: ["Pods", "Services", "Deployments", "StatefulSets"],
        nextSteps: ["Cloud Native", "Service Mesh"],
        image: "https://kubernetes.io/images/kubernetes-horizontal-color.png",
      },
    ],
  },
  // Advanced Phase
  {
    id: "cloud",
    title: "Cloud Native",
    icon: Cloud,
    phase: 4,
    category: "advanced",
    description: "Cloud platforms and services",
    subtopics: [
      {
        title: "Cloud Services",
        description: "Cloud platform essentials",
        concepts: ["IaaS", "PaaS", "SaaS", "Serverless"],
        nextSteps: ["Monitoring", "Security"],
        image: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
      },
      {
        title: "Cloud Security",
        description: "Secure cloud deployments",
        concepts: ["IAM", "Network Security", "Compliance"],
        nextSteps: ["DevSecOps", "SRE Practices"],
        image: "https://cdn.worldvectorlogo.com/logos/azure-1.svg",
      },
    ],
  },
];

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start DevOps Journey' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: { label: 'Version Control (Git)' },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    data: { label: 'CI/CD Pipelines' },
    position: { x: 250, y: 200 },
  },
  {
    id: '4',
    data: { label: 'Containerization (Docker)' },
    position: { x: 250, y: 300 },
  },
  {
    id: '5',
    data: { label: 'Container Orchestration (Kubernetes)' },
    position: { x: 250, y: 400 },
  },
  {
    id: '6',
    data: { label: 'Infrastructure as Code' },
    position: { x: 250, y: 500 },
  },
  {
    id: '7',
    type: 'output',
    data: { label: 'Monitoring & Logging' },
    position: { x: 250, y: 600 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e6-7', source: '6', target: '7' },
];

const PhaseTitle = ({ phase, title }: { phase: number; title: string }) => (
  <div className="flex items-center gap-2 text-2xl font-bold text-white mb-6">
    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
      {phase}
    </div>
    <h2>{title}</h2>
  </div>
);

const DevOpsFlow = () => {
  const navigate = useNavigate();

  const onNodeClick = (event: any, node: any) => {
    // Navigate to practice page with the selected topic
    navigate(`/devops-practice/${node.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar className="m-0 p-0" /> 
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DevOps Learning Journey</h1>
          <p className="text-xl text-gray-300">
            Follow this structured path to master DevOps - from fundamentals to advanced practices
          </p>
        </div>

        {/* Vertical Flowchart */}
        <div className="space-y-12">
          <div className="w-full h-screen">
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>

        {/* Topic Details Dialog */}
        <Dialog
          open={false}
          onOpenChange={() => {
            // setSelectedTopic(null);
            // setSelectedSubTopic(null);
          }}
        >
          <DialogContent className="max-w-4xl bg-gray-900 text-white border-gray-700">
            {/* {selectedTopic && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center">
                      {<selectedTopic.icon className="w-6 h-6 text-red-400" />}
                    </div>
                    <DialogTitle className="text-2xl text-white">{selectedTopic.title}</DialogTitle>
                  </div>
                </DialogHeader>

                {!selectedSubTopic ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {selectedTopic.subtopics.map((subtopic, index) => (
                      <Card
                        key={index}
                        className="bg-gray-800 border-gray-700 hover:border-red-500 cursor-pointer"
                        onClick={() => {
                          navigate(`/devops-practice?topic=${selectedTopic.id}&subtopic=${encodeURIComponent(subtopic.title)}`);
                        }}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg text-white">{subtopic.title}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {subtopic.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      {selectedSubTopic.image && (
                        <div className="w-full md:w-1/3">
                          <img
                            src={selectedSubTopic.image}
                            alt={selectedSubTopic.title}
                            className="w-full h-auto rounded-lg bg-white p-4"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-4 text-white">{selectedSubTopic.title}</h3>
                        <p className="text-gray-300 mb-6">{selectedSubTopic.description}</p>

                        {selectedSubTopic.concepts && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-red-400">Key Concepts</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedSubTopic.concepts.map((concept, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-full bg-red-900/50 text-red-300 text-sm"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedSubTopic.nextSteps && (
                          <div>
                            <h4 className="text-lg font-semibold mb-3 text-yellow-400">Next Steps</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedSubTopic.nextSteps.map((step, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-300 text-sm"
                                >
                                  {step}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )} */}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DevOpsFlow;
