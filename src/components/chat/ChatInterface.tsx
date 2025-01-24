import React, { useState, useEffect, useRef, forwardRef } from 'react';
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
  ChevronDown
} from "lucide-react";
import { langchainService } from '@/services/langchainService';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import aiGif from '@/assets/ai-tutor.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'understanding-check' | 'practice-question' | 'feedback' | 'error' | 'next-step-prompt';
  content: string;
  suggestedQuestions?: string[];
  practiceData?: {
    type: 'mcq' | 'debugging' | 'theoretical' | 'coding';
    options?: string[];
    code?: string;
    correctAnswer: string;
    isCorrect?: boolean;
    explanation?: string;
  };
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

const ChatInterface = forwardRef((props, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<{
    type: 'mcq' | 'debugging' | 'theoretical' | 'coding';
    question: string;
    options?: string[];
    code?: string;
    correctAnswer: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

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
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!message.trim()) return;

    setLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await langchainService.handleResponse(message);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'understanding-check',
        content: response.content,
        suggestedQuestions: response.suggestedQuestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      // Error handling is now done in langchainService, no need for error message here
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

        const question = await langchainService.generateQuestion(userQuery);
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
        const response = await langchainService.handleResponse(
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
      const evaluation = await langchainService.evaluateAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.correctAnswer
      );

      const feedbackMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'feedback',
        content: `${evaluation.isCorrect ? '✅ Correct!' : '❌ Incorrect'}\n\n${evaluation.feedback}\n\n${
          evaluation.isCorrect 
            ? evaluation.explanation 
            : `**Correct Answer:**\n${currentQuestion.correctAnswer}\n\n**Explanation:**\n${evaluation.explanation}`
        }`,
        practiceData: {
          type: currentQuestion.type,
          correctAnswer: currentQuestion.correctAnswer,
          options: currentQuestion.options,
          code: currentQuestion.code,
          isCorrect: evaluation.isCorrect,
          explanation: evaluation.explanation
        }
      };

      const nextStepMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'next-step-prompt',
        content: evaluation.isCorrect 
          ? "Great job! Would you like to:\n1. Move to a new topic (just ask your question)\n2. Get a suggested related topic to explore\n3. Practice more questions on this topic"
          : "Would you like to:\n1. Try another similar question\n2. Get a simpler explanation\n3. Move to a different topic",
        suggestedQuestions: []
      };

      setMessages(prev => [...prev, feedbackMessage, nextStepMessage]);
      
      if (!evaluation.isCorrect) {
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'error',
        content: 'Sorry, I had trouble evaluating your answer. Would you like to try again?'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    handleSendMessage(question);
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

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <TutorSidebar
        onDownload={handleDownloadPDF}
        onRestart={handleRestartChat}
        onCopy={handleCopyChat}
        onDelete={handleDeleteChat}
        onEdit={handleEditChat}
      />
      <div className="flex-1 flex flex-col max-w-5xl mx-auto">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4" ref={chatContainerRef}>
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
                {chatSuggestions.map((suggestion, index) => (
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
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={isRecording ? 'text-red-500' : ''}
              disabled={loading}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              disabled={loading}
              className="flex-1"
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
    </div>
  );
});

export default ChatInterface;
