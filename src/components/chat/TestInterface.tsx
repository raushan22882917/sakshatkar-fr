import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, ArrowRight, Code2, Bug } from "lucide-react";
import { testService } from '@/services/testService';
import { SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Question {
  id: string;
  type: 'mcq' | 'fillInBlanks' | 'code' | 'debugging' | 'puzzle' | 'multipleCorrect';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  code?: string;
  explanation?: string;
}

interface TestProps {
  moduleId: string;
  moduleName: string;
  onComplete: (score: number) => void;
}

const TestInterface: React.FC<TestProps> = ({ moduleId, moduleName, onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | string[])[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [multipleSelections, setMultipleSelections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const loadedQuestions = await testService.generateQuestions(moduleId, moduleName);
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    loadQuestions();
  }, [moduleId, moduleName]);

  const handleAnswerSelect = (answer: string | string[]) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleMultipleSelect = (option: string) => {
    const newSelections = new Set(multipleSelections);
    if (newSelections.has(option)) {
      newSelections.delete(option);
    } else {
      newSelections.add(option);
    }
    setMultipleSelections(newSelections);
    handleAnswerSelect(Array.from(newSelections));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
      setMultipleSelections(new Set());
    } else {
      const finalScore = calculateScore();
      setScore(finalScore);
      setIsCompleted(true);
      onComplete(finalScore);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (Array.isArray(question.correctAnswer)) {
        const selectedAns = selectedAnswers[index] as string[];
        if (arraysEqual(selectedAns.sort(), (question.correctAnswer as string[]).sort())) {
          correct++;
        }
      } else {
        if (selectedAnswers[index] === question.correctAnswer) {
          correct++;
        }
      }
    });
    return (correct / questions.length) * 100;
  };

  const arraysEqual = (a: string[], b: string[]) => {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  const getQuestionIcon = (type: Question['type']) => {
    switch (type) {
      case 'code':
        return <Code2 className="h-6 w-6" />;
      case 'debugging':
        return <Bug className="h-6 w-6" />;
      case 'puzzle':
        return <Brain className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {getQuestionIcon(question.type)}
          <h3 className="text-lg font-medium">{question.question}</h3>
        </div>

        {question.code && (
          <div className="my-4">
            <SyntaxHighlighter language="python" style={oneDark}>
              {question.code}
            </SyntaxHighlighter>
          </div>
        )}

        <div className="space-y-4">
          {question.type === 'mcq' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswers[currentQuestionIndex] === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'multipleCorrect' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={multipleSelections.has(option) ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleMultipleSelect(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'fillInBlanks' && (
            <Input
              type="text"
              placeholder="Type your answer..."
              value={selectedAnswers[currentQuestionIndex] as string || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="w-full"
            />
          )}

          {(question.type === 'code' || question.type === 'debugging') && (
            <Textarea
              placeholder="Write your code here..."
              value={selectedAnswers[currentQuestionIndex] as string || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="font-mono min-h-[200px]"
            />
          )}
        </div>
      </div>
    );
  };

  if (isCompleted) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold mb-4">Test Completed!</h2>
          <div className="text-6xl font-bold mb-4">
            {score}%
          </div>
          <div className="flex items-center justify-center text-lg">
            {score >= 80 ? (
              <div className="flex items-center text-green-500">
                <CheckCircle className="mr-2 h-6 w-6" />
                <span>Module Completed Successfully!</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <XCircle className="mr-2 h-6 w-6" />
                <span>Try again to achieve 80% or higher</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{moduleName} - Test</h2>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {renderQuestion()}

      {showExplanation && questions[currentQuestionIndex]?.explanation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-2">Explanation:</h4>
          <p className="text-gray-600">{questions[currentQuestionIndex].explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setShowExplanation(!showExplanation)}
          disabled={!questions[currentQuestionIndex]?.explanation}
        >
          {showExplanation ? 'Hide' : 'Show'} Explanation
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestionIndex]}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default TestInterface;
