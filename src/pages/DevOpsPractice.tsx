import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FaBook, FaCheck, FaLock, FaClock, FaCertificate, FaDownload } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Book, Globe, MessageSquare, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from 'react-router-dom';
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from '@monaco-editor/react';

interface PracticeContent {
  title: string;
  description: string;
  theory: string;
  practice: {
    question: string;
    hints: string[];
    solution: string;
  }[];
}

const practiceContent: { [key: string]: PracticeContent } = {
  // Git Basics
  '1-1': {
    title: 'Git Basics',
    description: 'Learn the fundamental Git commands and workflows',
    theory: `
# Git Basics

Git is a distributed version control system that helps track changes in source code during software development.

## Key Concepts
1. Repository (Repo)
2. Commit
3. Branch
4. Remote

## Basic Commands
- git init: Initialize a repository
- git add: Stage changes
- git commit: Save changes
- git push: Upload to remote
- git pull: Download from remote
    `,
    practice: [
      {
        question: 'Initialize a new Git repository and make your first commit',
        hints: [
          'Use git init to create a new repository',
          'Use git add to stage files',
          'Use git commit -m "message" to commit'
        ],
        solution: `
git init
git add .
git commit -m "Initial commit"
        `
      }
    ]
  },
  // Branching & Merging
  '1-2': {
    title: 'Branching & Merging',
    description: 'Master Git branch management and merge strategies',
    theory: `
# Git Branching

Branches allow you to develop features isolated from each other.

## Key Concepts
1. Branch Creation
2. Switching Branches
3. Merging
4. Resolving Conflicts

## Commands
- git branch: List branches
- git checkout -b: Create new branch
- git merge: Merge branches
    `,
    practice: [
      {
        question: 'Create a new feature branch and merge it back to main',
        hints: [
          'Create branch with git checkout -b',
          'Make changes and commit',
          'Switch back to main',
          'Merge the feature branch'
        ],
        solution: `
git checkout -b feature/new-feature
# make changes
git add .
git commit -m "Add new feature"
git checkout main
git merge feature/new-feature
        `
      }
    ]
  },
  // Jenkins
  '2-1': {
    title: 'Jenkins',
    description: 'Learn Jenkins pipeline configuration and automation',
    theory: `
# Jenkins CI/CD

Jenkins is an open-source automation server for building, testing, and deploying code.

## Key Concepts
1. Pipeline
2. Jenkinsfile
3. Stages
4. Steps

## Basic Pipeline
\`\`\`groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
    }
}
\`\`\`
    `,
    practice: [
      {
        question: 'Create a basic Jenkins pipeline with build and test stages',
        hints: [
          'Use pipeline syntax',
          'Define agent',
          'Create stages',
          'Add steps'
        ],
        solution: `
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}
        `
      }
    ]
  }
  // Add more practice content for other topics
};

const topics = [
  { 
    id: "ci_cd_pipelines", 
    name: "CI/CD Pipelines", 
    icon: <FaBook />,
    minTime: 1, // minimum time in minutes
    dependencies: [] // no dependencies, first topic
  },
  { 
    id: "containerization", 
    name: "Containerization and Orchestration", 
    icon: <FaBook />,
    minTime: 1,
    dependencies: ["ci_cd_pipelines"]
  },
  { 
    id: "iac", 
    name: "Infrastructure as Code (IaC)", 
    icon: <FaBook />,
    minTime: 1,
    dependencies: ["containerization"]
  },
  { 
    id: "cloud_computing", 
    name: "Cloud Computing and DevOps", 
    icon: <FaBook />,
    minTime: 1,
    dependencies: ["iac"]
  }
];

interface TopicContent {
  title: string;
  content: string;
}

interface TopicProgress {
  id: string;
  completed: boolean;
  timeSpent: number;
}

interface AIExplanationResponse {
  explanation: string | { section: string; text: string }[];
}

interface PopupInfo {
  word: string;
  explanation: string;
  translation: string;
  questions: string[];
  wikiUrl: string;
}

import { useNavigate } from 'react-router-dom';

const DevOpsPractice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = id ? practiceContent[id] : null;
  const [activeTab, setActiveTab] = React.useState('theory');
  const [selectedPractice, setSelectedPractice] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [selectedQuiz, setSelectedQuiz] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [showQuizAnswer, setShowQuizAnswer] = React.useState(false);

  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');
  const subtopic = searchParams.get('subtopic');
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [currentSubTopic, setCurrentSubTopic] = useState<string | null>(null);

  const [selectedTopicId, setSelectedTopicId] = useState(topics[0].id);
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null);
  const [selectedWord, setSelectedWord] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progressState, setProgressState] = useState<TopicProgress[]>(() => {
    const saved = localStorage.getItem('devops-progress');
    return saved ? JSON.parse(saved) : topics.map(t => ({ 
      id: t.id, 
      completed: false, 
      timeSpent: 0 
    }));
  });
  const [timer, setTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [allTopicsCompleted, setAllTopicsCompleted] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  useEffect(() => {
    if (topic && subtopic) {
      setCurrentTopic(topic);
      setCurrentSubTopic(subtopic);
    }
  }, [topic, subtopic]);

  useEffect(() => {
    if (currentTopic) {
      const topic = topics.find(t => t.id === currentTopic);
      if (topic) {
        setSelectedTopicId(topic.id);
      }
    }
  }, [currentTopic]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('devops-progress', JSON.stringify(progressState));
  }, [progressState]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        setProgressState(prev => prev.map(p => 
          p.id === selectedTopicId 
            ? { ...p, timeSpent: p.timeSpent + 1 }
            : p
        ));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, selectedTopicId]);

  // Fetch topic content
  useEffect(() => {
    const fetchTopicContent = async () => {
      const response = await fetch(`/data/topics/${selectedTopicId}.json`);
      const data = await response.json();
      setTopicContent(data);
      setTimer(0);
      setIsTimerActive(true);
    };

    fetchTopicContent();
  }, [selectedTopicId]);

  const { data: aiExplanation, isLoading: aiLoading } = useQuery({
    queryKey: ["aiExplanation", selectedWord],
    queryFn: async (): Promise<AIExplanationResponse> => {
      if (!selectedWord) return { explanation: "" };

      const { data, error } = await supabase.functions.invoke("explain-devops-term", {
        body: { term: selectedWord },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedWord,
  });

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") return;

    const text = selection.toString().trim();
    setSelectedText(text);

    // Get selection coordinates
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    });

    setIsLoading(true);
    try {
      // Get information from Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a DevOps expert. Provide information about the selected text in this JSON format:
              {
                "explanation": "Technical explanation of the term",
                "translation": "Simple explanation in plain English",
                "questions": ["3 related interview questions"],
                "wikiUrl": "Relevant Wikipedia URL"
              }`
            },
            {
              role: "user",
              content: `Explain this DevOps term: ${text}`
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error("Failed to get information");

      const data = await response.json();
      const info = JSON.parse(data.choices[0].message.content);
      
      setPopupInfo({
        word: text,
        ...info
      });
      setShowPopup(true);
    } catch (error) {
      console.error("Error getting information:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection2 = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      setSelectedWord(selectedText);
      setIsDialogOpen(true);
    }
  };

  const isTopicLocked = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || topic.dependencies.length === 0) return false;
    return !topic.dependencies.every(depId => 
      progressState.find(p => p.id === depId)?.completed
    );
  };

  const handleTopicComplete = () => {
    const currentTopic = topics.find(t => t.id === selectedTopicId);
    const currentProgress = progressState.find(p => p.id === selectedTopicId);
    
    if (!currentTopic || !currentProgress) return;

    if (currentProgress.timeSpent < currentTopic.minTime * 60) {
      toast({
        title: "Cannot complete yet",
        description: `Please spend at least ${currentTopic.minTime} minutes on this topic.`,
        variant: "destructive"
      });
      return;
    }

    setProgressState(prev => prev.map(p => 
      p.id === selectedTopicId ? { ...p, completed: true } : p
    ));

    toast({
      title: "Topic Completed!",
      description: "You can now move on to the next topic.",
    });

    // Check if all topics are completed
    const allCompleted = topics.every(topic => 
      progressState.find(p => p.id === topic.id)?.completed
    );

    setAllTopicsCompleted(allCompleted);

    if (allCompleted) {
      toast({
        title: "Congratulations!",
        description: "You have completed all topics! You can now download your certificate.",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleViewCertificate = () => {
    if (!allTopicsCompleted) {
      toast({
        title: "Cannot View Certificate",
        description: "Please complete all topics before viewing the certificate.",
        variant: "destructive"
      });
      return;
    }
    setShowCertificate(true);
  };

  const handleDownloadCertificate = () => {
    if (!allTopicsCompleted) {
      toast({
        title: "Cannot Download Certificate",
        description: "Please complete all topics before downloading the certificate.",
        variant: "destructive"
      });
      return;
    }
    window.print();
  };

  // Calculate completion status
  const completedTopics = progressState.filter(p => p.completed).length;
  const totalTopics = topics.length;
  const completionPercentage = (completedTopics / totalTopics) * 100;

  if (!content) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Topic Not Found</CardTitle>
            <CardDescription>
              The requested topic could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topics Sidebar */}
      <div className="w-64 border-r bg-gray-100 dark:bg-gray-800">
        <ScrollArea className="h-full">
          <div className="p-4">
            {/* Overall Progress */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{progressState.filter(p => p.completed).length}/{topics.length} Topics</span>
              </div>
              <Progress 
                value={(progressState.filter(p => p.completed).length / topics.length) * 100}
                className="h-2"
              />
            </div>

            {/* Certificate Actions */}
            <div className="mb-6 space-y-2">
              <div className="text-sm mb-2">
                {allTopicsCompleted ? (
                  <p className="text-green-600 dark:text-green-400 flex items-center">
                    <FaCheck className="mr-2" />
                    Certificate Unlocked!
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete all topics to unlock certificate
                    ({completedTopics}/{totalTopics} completed)
                  </p>
                )}
              </div>
              <Button
                onClick={handleViewCertificate}
                disabled={!allTopicsCompleted}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <FaCertificate />
                <span>{allTopicsCompleted ? "View Certificate" : "Complete All Topics"}</span>
              </Button>
              <Button
                onClick={handleDownloadCertificate}
                disabled={!allTopicsCompleted}
                className="bg-green-500 hover:bg-green-600"
              >
                <FaDownload />
                <span>{allTopicsCompleted ? "Download Certificate" : "Complete All Topics"}</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

            {/* Topics List */}
            <div className="space-y-2">
              <h3 className="font-semibold mb-2">Learning Path</h3>
              {topics.map((topic) => {
                const topicProgress = progressState.find(p => p.id === topic.id);
                const isLocked = isTopicLocked(topic.id);
                const isCompleted = topicProgress?.completed;

                return (
                  <button
                    key={topic.id}
                    onClick={() => !isLocked && setSelectedTopicId(topic.id)}
                    disabled={isLocked}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between
                      ${isLocked 
                        ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50" 
                        : selectedTopicId === topic.id
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    <div className="flex items-center flex-1">
                      <span className="mr-2">{topic.icon}</span>
                      <span className="truncate">{topic.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {isLocked && <FaLock className="text-gray-500" />}
                      {isCompleted && <FaCheck className="text-green-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaClock />
              <span>{formatTime(timer)}</span>
            </div>
            <Progress 
              value={(timer / (topics.find(t => t.id === selectedTopicId)?.minTime || 1) / 60) * 100} 
              className="w-40"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleTopicComplete}
              disabled={progressState.find(p => p.id === selectedTopicId)?.completed}
              className="bg-green-500 hover:bg-green-600"
            >
              Complete Topic
            </Button>
          </div>
        </div>

        {content && (
          <div className="container mx-auto p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{content.title}</CardTitle>
                <CardDescription>{content.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="mb-4" />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="theory">Theory</TabsTrigger>
                <TabsTrigger value="practice">Practice</TabsTrigger>
              </TabsList>

              <TabsContent value="theory">
                <Card>
                  <CardContent className="p-6">
                    <ScrollArea className="h-[600px]">
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: content.theory }} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="practice">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="prose dark:prose-invert">
                        <h3>Practice Question {selectedPractice + 1}</h3>
                        <p>{content.practice[selectedPractice].question}</p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Hints:</h4>
                        <ul className="list-disc pl-6">
                          {content.practice[selectedPractice].hints.map((hint, index) => (
                            <li key={index}>{hint}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Your Solution:</h4>
                        <Editor
                          height="200px"
                          defaultLanguage="shell"
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                          }}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setShowSolution(!showSolution)}
                        >
                          {showSolution ? 'Hide Solution' : 'Show Solution'}
                        </Button>
                        <Button
                          onClick={() => {
                            const newProgress = ((selectedPractice + 1) / content.practice.length) * 100;
                            setProgress(newProgress);
                            if (selectedPractice < content.practice.length - 1) {
                              setSelectedPractice(selectedPractice + 1);
                              setShowSolution(false);
                            }
                          }}
                        >
                          Next Question
                        </Button>
                      </div>

                      {showSolution && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Solution:</h4>
                          <Editor
                            height="200px"
                            defaultLanguage="shell"
                            value={content.practice[selectedPractice].solution}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              readOnly: true,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* AI Explanation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Explanation: {selectedWord}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {aiLoading ? (
              <p>Loading explanation...</p>
            ) : (
              <div className="prose dark:prose-invert">
                {typeof aiExplanation?.explanation === "string" ? (
                  <p>{aiExplanation.explanation}</p>
                ) : (
                  <div>
                    {aiExplanation?.explanation.map((section, index) => (
                      <div key={index}>
                        <h3>{section.section}</h3>
                        <p>{section.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={showCertificate} onOpenChange={(open) => {
        if (!allTopicsCompleted) {
          toast({
            title: "Certificate Not Available",
            description: "Complete all topics to view your certificate.",
            variant: "destructive"
          });
          return;
        }
        setShowCertificate(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-2xl">
              <FaCertificate className="text-yellow-500 mr-2" />
              Certificate of Completion
            </DialogTitle>
          </DialogHeader>
          {allTopicsCompleted ? (
            <div className="p-6 text-center space-y-4">
              <div className="border-4 border-yellow-500 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-6">Certificate of Achievement</h2>
                <p className="text-lg mb-4">This is to certify that</p>
                <p className="text-2xl font-bold text-purple-600 mb-4">[Your Name]</p>
                <p className="text-lg mb-6">has successfully completed all DevOps Practice topics</p>
                <div className="text-left mb-6">
                  <h3 className="font-semibold mb-2">Completed Topics:</h3>
                  <ul className="list-disc list-inside">
                    {topics.map(topic => (
                      <li key={topic.id} className="flex items-center space-x-2">
                        <FaCheck className="text-green-500" />
                        <span>{topic.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-md text-gray-600">Completed on: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <Button 
                  onClick={handleDownloadCertificate}
                  className="bg-green-500 hover:bg-green-600 flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Download Certificate</span>
                </Button>
                <Button 
                  onClick={() => setShowCertificate(false)} 
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-lg text-red-500">
                Please complete all topics to view your certificate.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Word Selection Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-500" />
              <span>Information: </span>
              <span className="text-blue-600">{selectedText}</span>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500" />
                  <div className="w-12 h-12 border-4 border-transparent rounded-full animate-pulse absolute top-0" />
                </div>
                <p className="text-gray-600">Getting information...</p>
              </div>
            </div>
          ) : popupInfo ? (
            <Tabs defaultValue="explanation" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="explanation" className="flex-1">
                  <Book className="w-4 h-4 mr-2" />
                  Explanation
                </TabsTrigger>
                <TabsTrigger value="translation" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Simplified
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex-1">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Questions
                </TabsTrigger>
                <TabsTrigger value="wiki" className="flex-1">
                  <Globe className="w-4 h-4 mr-2" />
                  Wiki
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[300px] mt-4 rounded-md border p-4">
                <TabsContent value="explanation">
                  <div className="prose">
                    <h4 className="text-lg font-semibold mb-2">Technical Explanation</h4>
                    <p>{popupInfo.explanation}</p>
                  </div>
                </TabsContent>

                <TabsContent value="translation">
                  <div className="prose">
                    <h4 className="text-lg font-semibold mb-2">In Simple Terms</h4>
                    <p>{popupInfo.translation}</p>
                  </div>
                </TabsContent>

                <TabsContent value="questions">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Related Interview Questions</h4>
                    <ul className="space-y-3">
                      {popupInfo.questions.map((question, index) => (
                        <li key={index} className="bg-gray-50 p-3 rounded-lg">
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="wiki">
                  <div className="prose">
                    <h4 className="text-lg font-semibold mb-2">Wikipedia Reference</h4>
                    <a 
                      href={popupInfo.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Learn more on Wikipedia
                    </a>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DevOpsPractice;
