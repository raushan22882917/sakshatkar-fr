import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  User,
  Download,
  RefreshCw,
  Copy,
  Trash2,
  Edit,
  MessageSquare,
  FileDown,
  VolumeIcon,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  PlusCircle,
  Briefcase,
  Code2,
  HelpCircle as HelpCircleIcon,
  ChevronDown,
  Menu,
  CheckCircle,
  Code,
  Brain,
  Cpu,
  BookOpen,
  PenTool
} from "lucide-react";
import { langchainService } from '@/services/langchainService';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import aiGif from '@/assets/ai-tutor.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import topicsData from '../../data/topics.json';
import { Progress } from "@/components/ui/progress";
import { Question } from '@/types/question';
import { LangChainService } from '@/services/langchain.service';

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'understanding-check' | 'practice-question' | 'feedback' | 'error' | 'next-step-prompt' | 'system';
  content: string;
  suggestedQuestions?: string[];
  practiceData?: {
    type: 'mcq' | 'debugging' | 'theoretical' | 'coding';
    options?: string[];
    code?: string;
    correctAnswer: string;
    isCorrect?: boolean;
    explanation?: string;
    testCases?: { input: string; expectedOutput: string; }[];
    blanks?: string[];
    hints?: string[];
  };
  timestamp?: string;
}

interface TutorSidebarProps {
  onDownload: () => void;
  onRestart: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({
  onDownload,
  onRestart,
  onCopy,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="w-64 bg-secondary/10 border-r border-border p-4 flex flex-col h-full">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-primary/10 flex items-center justify-center">
          <img
            src={aiGif}
            alt="AI Teacher"
            className="w-16 h-16 object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold">StudyMate Ai Teacher</h3>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Here to guide you through coding basics
        </p>
      </div>
      
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onDownload}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onRestart}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Restart Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Chat
        </Button>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Learning Progress</span>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-2.5 mt-2">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
      </div>
    </div>
  );
};

interface SuggestedQuestionProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionProps> = ({
  questions,
  onQuestionClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-4">
      <div
        className="flex items-center gap-2 cursor-pointer mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <HelpCircleIcon className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Suggested Questions</span>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-4 hover:bg-transparent"
        >
          <PlusCircle
            className={cn("h-4 w-4 transition-transform", {
              "transform rotate-45": expanded,
            })}
          />
        </Button>
      </div>
      {expanded && (
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-nowrap gap-2 min-w-full">
            {questions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                className="whitespace-nowrap text-sm px-3 py-1 h-auto flex-shrink-0"
                onClick={() => onQuestionClick(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const chatSuggestions = [
  {
    icon: <Code2 className="w-8 h-8" />,
    text: "Ask doubt related to coding",
    prompt: "I have a coding doubt about...",
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    text: "Prepare for interview",
    prompt: "Help me prepare for a coding interview...",
  },
  {
    icon: <HelpCircleIcon className="w-8 h-8" />,
    text: "Ask general doubt",
    prompt: "I have a question about...",
  },
];

interface TopicData {
  id: string;
  title: string;
  subtopics: Array<{
    id: string;
    title: string;
  }>;
}

interface ChatInterfaceHandle {
  sendMessage: (message: string) => void;
}

type QuestionType = 'mcq' | 'debugging' | 'theoretical' | 'coding';

interface EvaluationResult {
  isCorrect: boolean;
  feedback: string;
  explanation?: string;
}

interface QuestionResult {
  isCorrect: boolean;
  feedback: string;
  explanation?: string;
}

interface TestInterfaceProps {
  moduleId: string;
  moduleName: string;
  onComplete: (score: number) => void;
}

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

const TestInterface: React.FC<TestInterfaceProps> = ({ moduleId, moduleName, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Generate questions based on the module
    const generatedQuestions = generateQuestionsForModule(moduleName);
    setQuestions(generatedQuestions);
  }, [moduleName]);

  const generateQuestionsForModule = (module: string): Question[] => {
    // This is a sample question generator. In a real app, you'd fetch these from an API
    return [
      {
        type: 'mcq',
        question: `What is the main purpose of ${module}?`,
        options: [
          'Option A - Sample answer 1',
          'Option B - Sample answer 2',
          'Option C - Sample answer 3',
          'Option D - Sample answer 4'
        ],
        correctAnswer: 'Option A - Sample answer 1'
      },
      {
        type: 'mcq',
        question: `Which of the following is true about ${module}?`,
        options: [
          'Option A - Sample fact 1',
          'Option B - Sample fact 2',
          'Option C - Sample fact 3',
          'Option D - Sample fact 4'
        ],
        correctAnswer: 'Option B - Sample fact 2'
      },
      {
        type: 'mcq',
        question: `In ${module}, what is the best practice for...?`,
        options: [
          'Option A - Best practice 1',
          'Option B - Best practice 2',
          'Option C - Best practice 3',
          'Option D - Best practice 4'
        ],
        correctAnswer: 'Option C - Best practice 3'
      },
      {
        type: 'mcq',
        question: `Which concept is most closely related to ${module}?`,
        options: [
          'Option A - Related concept 1',
          'Option B - Related concept 2',
          'Option C - Related concept 3',
          'Option D - Related concept 4'
        ],
        correctAnswer: 'Option D - Related concept 4'
      },
      {
        type: 'mcq',
        question: `What is a common problem when working with ${module}?`,
        options: [
          'Option A - Common issue 1',
          'Option B - Common issue 2',
          'Option C - Common issue 3',
          'Option D - Common issue 4'
        ],
        correctAnswer: 'Option A - Common issue 1'
      }
    ];
  };

  const generateTestQuestions = async (module: string): Promise<Question[]> => {
    const langChainService = new LangChainService();
    const questions = [];
    for (let i = 0; i < 5; i++) {
      const question = await langChainService.generateQuestion(module);
      questions.push(question);
    }
    return questions;
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      const correctAnswers = newAnswers.filter(
        (answer, index) => answer === questions[index].correctAnswer
      );
      const finalScore = (correctAnswers.length / questions.length) * 100;
      setScore(finalScore);
      setShowResults(true);
      if (finalScore === 100) {
        onComplete(finalScore);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {!showResults ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</h3>
            <Progress value={(currentQuestionIndex / questions.length) * 100} className="w-32" />
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <p className="text-lg mb-4">{questions[currentQuestionIndex]?.question}</p>
            <div className="space-y-2">
              {questions[currentQuestionIndex]?.options.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswers[currentQuestionIndex] === option ? "secondary" : "outline"}
                  className="w-full justify-start text-left"
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <h3 className="text-2xl font-semibold">Test Results</h3>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <div className="text-4xl font-bold mb-2">{score}%</div>
            <p className="text-muted-foreground">
              You got {userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length} out of {questions.length} questions correct
            </p>
          </div>
          {score === 100 ? (
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle className="h-6 w-6" />
              <span>Module Completed!</span>
            </div>
          ) : (
            <Button onClick={() => {
              setShowResults(false);
              setCurrentQuestionIndex(0);
              setUserAnswers([]);
            }}>
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const getInitialSuggestions = (module: string) => {
  return [
    {
      text: "Introduction",
      prompt: `Explain the introduction and basic concepts of ${module}`,
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      text: "Examples",
      prompt: `Show practical examples of ${module}`,
      icon: <Code2 className="w-8 h-8" />
    },
    {
      text: "Practice",
      prompt: `Give me practice exercises for ${module}`,
      icon: <PenTool className="w-8 h-8" />
    }
  ];
};

interface TopicSession {
  messages: ChatMessage[];
  lastActive: string;
}

const ChatInterface = forwardRef<ChatInterfaceHandle>((props, ref) => {
  const { topicId } = useParams<{ topicId: string }>();
  const location = useLocation();
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'test'>('chat');
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [currentSuggestions, setCurrentSuggestions] = useState(chatSuggestions);
  const [topicSessions, setTopicSessions] = useState<{ [key: string]: TopicSession }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentLab = labs.find(lab => lab.id === topicId);

  useEffect(() => {
    if (currentLab?.modules.length > 0) {
      setSelectedSubtopic(currentLab.modules[0]);
    }
  }, [topicId, currentLab]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const labId = searchParams.get('lab');
    if (labId) {
      setSelectedLab(labId);
      setSelectedModule(null); // Reset selected module when lab changes
    }
  }, [location.search]);

  const getSelectedLabModules = () => {
    if (!selectedLab) return [];
    const lab = labs.find(l => l.id === selectedLab);
    return lab ? lab.modules : [];
  };

  const handleSubtopicClick = (subtopicId: string) => {
    setSelectedSubtopic(subtopicId);
    // Here you can trigger the chat to load content for this subtopic
  };

  const getModuleIntroduction = (module: string) => {
    // This would ideally come from your API or database
    const introductions: { [key: string]: string } = {
      'Variables and Data Types': `Let's dive into Variables and Data Types in Python!

In this module, we'll cover:
1. What are variables and why we need them
2. Different data types in Python:
   - Numbers (integers, floats)
   - Strings (text)
   - Booleans (True/False)
   - Lists, tuples, and dictionaries
3. Type conversion and checking
4. Best practices for naming variables

Let's start with the basics. Would you like to:
1. Learn about variables
2. Explore different data types
3. See some practical examples
4. Try some hands-on exercises

What would you like to know more about?`,

      'Control Flow': `Welcome to Control Flow in Python!

In this module, we'll explore:
1. Conditional statements (if, elif, else)
2. Loops (for and while)
3. Break and continue statements
4. Loop control and iteration
5. Nested conditions and loops

We'll start with the fundamentals and work our way up to more complex concepts.
What aspect of control flow would you like to learn about first?`,

      'Functions': `Welcome to Python Functions!

We'll cover:
1. Function definition and syntax
2. Parameters and arguments
3. Return values
4. Default arguments
5. Lambda functions
6. Function scope and namespaces

Functions are essential building blocks in Python. They help us:
- Organize code
- Avoid repetition
- Make code reusable
- Break down complex problems

Where would you like to begin?`,
    };

    return introductions[module] || `Welcome to ${module}!

Let's explore this topic together. We'll cover:
1. Basic concepts and fundamentals
2. Key principles and best practices
3. Practical examples and use cases
4. Common challenges and solutions

What would you like to learn about first?`;
  };

  const handleModuleClick = async (module: string) => {
    // Save current session if exists
    if (selectedModule && messages.length > 0) {
      setTopicSessions(prev => ({
        ...prev,
        [selectedModule]: {
          messages,
          lastActive: new Date().toISOString()
        }
      }));
    }

    setSelectedModule(module);
    setShowSuggestions(true);
    setCurrentSuggestions(getInitialSuggestions(module));
    
    // Load existing session or start new one
    if (topicSessions[module]) {
      setMessages(topicSessions[module].messages);
    } else {
      // Start new session with welcome message
      setMessages([
        {
          id: Date.now().toString(),
          type: 'system',
          content: `📚 **Selected Topic: ${module}**\n\nI'm here to help you learn about ${module}. What would you like to know?\n\nYou can:\n1. Learn the introduction and basic concepts\n2. See practical examples\n3. Try practice exercises\n\nChoose an option above or ask any question about ${module}!`,
          suggestedQuestions: [
            `What is ${module}?`,
            `Give me examples of ${module}`,
            `What are the key concepts in ${module}?`,
            `How is ${module} used in real-world applications?`
          ],
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const generateTestQuestions = async (module: string): Promise<Question[]> => {
    const langChainService = new LangChainService();
    const questions = [];
    for (let i = 0; i < 5; i++) {
      const question = await langChainService.generateQuestion(module);
      questions.push(question);
    }
    return questions;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
  };

  const handleEdit = () => {
    // Implement edit functionality
  };

  const handleDelete = () => {
    // Implement delete functionality
  };

  React.useImperativeHandle(ref, () => ({
    sendMessage: (message: string) => {
      handleSendMessage(message);
    }
  }));

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll when new messages are added
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    // Save current session when component unmounts
    if (selectedModule && messages.length > 0) {
      setTopicSessions(prev => ({
        ...prev,
        [selectedModule]: {
          messages,
          lastActive: new Date().toISOString()
        }
      }));
    }
  }, [messages, selectedModule]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const sessionHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const langChainService = new LangChainService();
      const response = await langChainService.generateResponse(message, selectedModule || '', sessionHistory);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setInput('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnderstanding = async (understood: boolean) => {
    setLoading(true);

    if (understood) {
      try {
        // Get the original user query
        const userQuery = messages.find(m => m.type === 'user')?.content;
        if (!userQuery) {
          throw new Error('Could not find original user query');
        }

        const question: Question = {
          type: 'mcq',
          question: 'What is your question?',
          options: ["Option 1", "Option 2"],
          correctAnswer: "Option 1"
        };
        setCurrentQuestion(question);

        const questionMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'practice-question',
          content: question.type === 'mcq' 
            ? `${question.question}\n\nChoose the correct answer:\n${question.options?.join('\n')}`
            : question.type === 'debugging'
            ? `${question.question}\n\nDebug this code:\n\`\`\`typescript\n${question.code}\n\`\`\``
            : question.type === 'theoretical'
            ? `${question.question}\n\nProvide a detailed explanation.`
            : `${question.question}\n\nWrite your code solution.`,
          practiceData: {
            type: question.type,
            options: question.options,
            code: question.code,
            correctAnswer: question.correctAnswer,
            testCases: question.testCases,
            blanks: question.blanks,
            hints: question.hints
          },
        };

        setMessages(prev => [...prev, questionMessage]);
      } catch (error) {
        console.error('Error in handleUnderstanding:', error);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'error',
          content: "I couldn't generate a specific question for your topic, but I've provided a relevant practice question instead. Feel free to answer it or ask for a different one!"
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      try {
        const lastExplanation = messages[messages.length - 1].content;
        const langChainService = new LangChainService();
        const response = await langChainService.handleResponse(
          `I need a simpler explanation of: "${lastExplanation}". Please break it down into smaller, easier-to-understand steps.`
        );

        const simplifiedMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'understanding-check',
          content: response.content,
          suggestedQuestions: response.suggestedQuestions
        };

        setMessages(prev => [...prev, simplifiedMessage]);
      } catch (error) {
        console.error('Error getting simplified explanation:', error);
      }
    }

    setLoading(false);
  };

  const handlePracticeAnswer = async (questionId: string, answer: string) => {
    if (!currentQuestion) return;

    setLoading(true);

    try {
      const langChainService = new LangChainService();
      const result = await langChainService.evaluateAnswer(answer, messages[messages.length - 1].content);
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'feedback',
          content: result.feedback,
          timestamp: new Date().toISOString(),
        }
      ]);

      if (result.isCorrect) {
        // Handle correct answer
        handleUnderstanding(true);
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'error',
          content: 'Sorry, there was an error evaluating your answer.',
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    setInput('');
    setLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const langChainService = new LangChainService();
      const response = await langChainService.handleResponse(question, selectedModule);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'understanding-check',
        content: response.content,
        suggestedQuestions: response.suggestedQuestions || [
          `Can you explain more about ${selectedModule}?`,
          `What are some advanced concepts in ${selectedModule}?`,
          `Show me some examples of ${selectedModule}`,
          `What are common problems with ${selectedModule}?`
        ]
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in handleSuggestedQuestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleDownloadPDF = async () => {
    if (!chatContainerRef.current) return;
    
    try {
      const canvas = await html2canvas(chatContainerRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`chat-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleRestartChat = () => {
    setMessages([]);
    setCurrentQuestion(null);
    setShowSuggestions(true);
  };

  const handleCopyChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n');
    navigator.clipboard.writeText(chatContent);
  };

  const handleDeleteChat = () => {
    setMessages([]);
    setCurrentQuestion(null);
    setShowSuggestions(true);
  };

  const handleEditChat = () => {
    // Implement edit functionality
    console.log('Edit chat functionality to be implemented');
  };

  const handleTextToSpeech = (messageId: string, text: string) => {
    if (speaking === messageId) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(null);
    setSpeaking(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleModuleCompletion = (moduleId: string, score: number) => {
    if (score === 100) {
      // Add module to completed modules
      setCompletedModules(prev => new Set([...prev, moduleId]));
      
      // Add completion message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `🎉 Congratulations! You've mastered the ${moduleId} module!\n\nYou can now proceed to the next module or review this one again.`,
        timestamp: new Date().toISOString()
      }]);

      // Scroll to show the completion message
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} shadow-lg transition-all duration-300 overflow-hidden border-r`}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Labs</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Labs List */}
          {!selectedLab ? (
            <div className="space-y-4">
              {labs.map((lab) => (
                <div key={lab.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {lab.icon}
                    <h3 className="font-medium">{lab.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{lab.description}</p>
                  <Button
                    className="w-full"
                    onClick={() => setSelectedLab(lab.id)}
                  >
                    Start Learning
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Selected Lab Modules */}
              <div className="mb-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedLab(null)}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </Button>
                <h3 className="font-medium">
                  {labs.find(l => l.id === selectedLab)?.title}
                </h3>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto">
                {getSelectedLabModules().map((module, index) => {
                  const isCompleted = completedModules.has(module);
                  const isSelected = selectedModule === module;
                  return (
                    <div key={index} className="space-y-1">
                      <Button
                        variant={isSelected ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-left relative pl-9",
                          isCompleted && "text-green-600 hover:text-green-700"
                        )}
                        onClick={() => handleModuleClick(module)}
                      >
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : isSelected ? (
                            <div className="h-4 w-4 rounded-full bg-primary" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                        <span className="truncate">{module}</span>
                      </Button>
                      {/* Test button under each module */}
                      {isSelected && !isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full ml-9 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                          onClick={() => setActiveTab('test')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Take Module Test
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Tabs */}
        <div className="border-b px-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'chat' ? "default" : "ghost"}
              onClick={() => setActiveTab('chat')}
              className="rounded-none border-b-2 border-transparent"
              style={{ borderBottomColor: activeTab === 'chat' ? 'var(--primary)' : 'transparent' }}
            >
              Chat
            </Button>
            <Button
              variant={activeTab === 'test' ? "default" : "ghost"}
              onClick={() => setActiveTab('test')}
              className="rounded-none border-b-2 border-transparent"
              style={{ borderBottomColor: activeTab === 'test' ? 'var(--primary)' : 'transparent' }}
            >
              Test
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            // Chat Content
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4" ref={chatContainerRef}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3",
                        message.type === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.type !== 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={aiGif} 
                            alt="AI" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-2xl p-4 rounded-lg shadow-sm",
                          message.type === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                          message.type === 'practice-question' && "bg-secondary",
                          message.type === 'understanding-check' && "bg-accent"
                        )}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {message.type !== 'user' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-8 w-8 p-0",
                                  speaking === message.id && "text-primary"
                                )}
                                onClick={() => handleTextToSpeech(message.id, message.content)}
                              >
                                <VolumeIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="whitespace-pre-wrap break-words">
                            {message.type === 'practice-question' ? (
                              <>
                                <h4 className="text-lg font-semibold mb-2">Practice Question</h4>
                                <ReactMarkdown
                                  components={{
                                    code: ({ node, inline, className, children, ...props }: CodeProps) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return !inline && match ? (
                                        <SyntaxHighlighter
                                          {...props}
                                          style={oneDark}
                                          language={match[1]}
                                          PreTag="div"
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                      ) : (
                                        <code {...props} className={className}>
                                          {children}
                                        </code>
                                      );
                                    },
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </>
                            ) : message.type === 'feedback' ? (
                              <>
                                <h4 className="text-lg font-semibold mb-2">Feedback</h4>
                                <ReactMarkdown
                                  components={{
                                    code: ({ node, inline, className, children, ...props }: CodeProps) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return !inline && match ? (
                                        <SyntaxHighlighter
                                          {...props}
                                          style={oneDark}
                                          language={match[1]}
                                          PreTag="div"
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                      ) : (
                                        <code {...props} className={className}>
                                          {children}
                                        </code>
                                      );
                                    },
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </>
                            ) : (
                              <ReactMarkdown
                                components={{
                                  code: ({ node, inline, className, children, ...props }: CodeProps) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        {...props}
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code {...props} className={className}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                          
                          {message.type === 'understanding-check' && !loading && (
                            <div className="mt-4 space-y-4">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnderstanding(true)}
                                  className="bg-green-500/10 hover:bg-green-500/20 transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4 mr-2" />
                                  Yes, I understand
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnderstanding(false)}
                                  className="bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                >
                                  <ThumbsDown className="w-4 h-4 mr-2" />
                                  No, explain simpler
                                </Button>
                              </div>

                              {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                                <SuggestedQuestions
                                  questions={message.suggestedQuestions}
                                  onQuestionClick={handleSuggestedQuestion}
                                />
                              )}
                            </div>
                          )}

                          {message.type === 'practice-question' && message.practiceData && (
                            <div className="mt-4 space-y-4">
                              {message.practiceData.code && (
                                <div className="relative">
                                  <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                                    <code className="language-python">{message.practiceData.code}</code>
                                  </pre>
                                </div>
                              )}
                              
                              {message.practiceData.options ? (
                                <div className="space-y-2">
                                  {message.practiceData.options.map((option, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      className="w-full justify-start hover:bg-accent transition-colors text-left"
                                      onClick={() => handlePracticeAnswer(message.id, option)}
                                    >
                                      <span className="font-mono mr-2">{String.fromCharCode(65 + index)}.</span>
                                      {option}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Type your answer here..."
                                    className="min-h-[100px] resize-y"
                                    onChange={(e) => setInput(e.target.value)}
                                  />
                                  <Button
                                    onClick={() => handlePracticeAnswer(message.id, input)}
                                    className="w-full bg-primary hover:bg-primary/90 transition-colors"
                                  >
                                    Submit Answer
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {message.type === 'feedback' && message.practiceData?.explanation && (
                            <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border">
                              <h4 className="text-sm font-semibold mb-2">Explanation:</h4>
                              <p className="text-sm text-muted-foreground">{message.practiceData.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  ))}
                  {showSuggestions && messages.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-4">
                      {currentSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="flex flex-col items-center p-6 h-auto space-y-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleSuggestionClick(suggestion.prompt)}
                        >
                          {suggestion.icon}
                          <span className="text-sm text-center">{suggestion.text}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-px" />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-background border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <Button
                    onClick={handleSendClick}
                    disabled={loading || !input.trim()}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Test Content
            <div className="h-full overflow-y-auto bg-background">
              {selectedModule && (
                <TestInterface
                  moduleId={selectedModule}
                  moduleName={selectedModule}
                  onComplete={(score) => {
                    handleModuleCompletion(selectedModule, score);
                    if (score === 100) {
                      // Wait a bit before switching back to chat
                      setTimeout(() => {
                        setActiveTab('chat');
                      }, 1500);
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ChatInterface;
