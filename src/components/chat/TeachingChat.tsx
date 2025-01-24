import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aiTeacherPrompt } from './prompts/aiTeacherPrompt';
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: string;
  practiceData?: PracticeQuestion;
  isCorrect?: boolean;
}

interface PracticeQuestion {
  question: string;
  type: 'mcq' | 'subjective' | 'debugging' | 'coding' | 'fill_in_blank';
  options?: string[];
  code?: string;
  testCases?: { input: string; expectedOutput: string }[];
  blanks?: string[];
  hints?: string[];
  correctAnswer?: string;
}

interface TeachingChatProps {
  onComplete?: () => void;
  isLoading?: boolean;
}

interface PracticeQuestionProps {
  question: PracticeQuestion;
  onAnswer: (answer: string) => void;
}

const PracticeQuestionDisplay: React.FC<PracticeQuestionProps> = ({ question, onAnswer }) => {
  const [answer, setAnswer] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!answer && !selectedOption) {
      toast({
        title: "Error",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    onAnswer(answer || selectedOption);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="mcq-option"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'subjective':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[150px]"
            />
          </div>
        );

      case 'debugging':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{question.code}</code>
            </pre>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Explain the bug and provide the corrected code..."
              className="min-h-[200px]"
            />
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            {question.testCases && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-medium mb-2">Test Cases:</p>
                {question.testCases.map((tc, index) => (
                  <div key={index} className="mb-2">
                    <p>Input: {tc.input}</p>
                    <p>Expected Output: {tc.expectedOutput}</p>
                  </div>
                ))}
              </div>
            )}
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your code here..."
              className="min-h-[200px] font-mono"
            />
          </div>
        );

      case 'fill_in_blank':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            {question.blanks && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Fill in with: {question.blanks.join(', ')}</p>
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderQuestionContent()}
      {question.hints && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-medium mb-2">Hints:</p>
          <ul className="list-disc list-inside">
            {question.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
      <Button onClick={handleSubmit} className="w-full">
        Submit Answer
      </Button>
    </div>
  );
};

export function TeachingChat({ onComplete, isLoading = false }: TeachingChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [currentQuestion, setCurrentQuestion] = React.useState<PracticeQuestion | null>(null);
  const { toast } = useToast();

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion) return;

    try {
      const evaluation = await langchainService.evaluateAnswer(
        currentQuestion,
        answer,
        currentQuestion.correctAnswer
      );

      // Add the user's answer to messages
      setMessages(prev => [...prev, {
        role: 'user',
        content: answer,
        type: 'answer'
      }]);

      // Add feedback message with appropriate styling
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: evaluation.feedback,
        type: 'feedback',
        isCorrect: evaluation.isCorrect
      }]);

      // Clear current question after feedback
      setCurrentQuestion(null);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      toast({
        title: "Error",
        description: "Failed to evaluate your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'practice-question' && message.practiceData) {
      setCurrentQuestion(message.practiceData);
      return (
        <PracticeQuestionDisplay
          question={message.practiceData}
          onAnswer={handleAnswerSubmit}
        />
      );
    }

    if (message.type === 'feedback') {
      const [resultLine, tipLine] = message.content.split('\n');
      return (
        <div className={`p-4 rounded-lg ${message.isCorrect ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <p className={`font-medium ${message.isCorrect ? 'text-green-700' : 'text-yellow-700'}`}>
            {resultLine}
          </p>
          <p className="text-gray-600 mt-1">{tipLine}</p>
        </div>
      );
    }

    return (
      <>
        <strong>{message.role === 'assistant' ? 'Teacher: ' : 'You: '}</strong>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </>
    );
  };

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    try {
      // TODO: Implement API call to get AI response
      const aiResponse: Message = {
        role: 'assistant',
        content: aiTeacherPrompt
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="flex flex-col h-[600px]">
        <div className="mb-4">
          <Label htmlFor="topic">Select Topic</Label>
          <Select value={''} onValueChange={() => { }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="language">Language</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'assistant' ? 'text-blue-600' : 'text-gray-800'
              }`}
            >
              {renderMessage(message)}
            </div>
          ))}
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
