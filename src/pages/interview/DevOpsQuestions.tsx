import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIDialog } from '@/components/interview/AIDialog';
import { Brain, Volume2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import devopsQuestions from '@/data/interview-questions/devops.json';

export function DevOpsQuestions() {
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  const speakText = (text: string, questionId: number) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      if (isSpeaking === questionId) {
        setIsSpeaking(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(null);
      setIsSpeaking(questionId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">DevOps Interview Questions & Answers</h1>
          <p className="text-muted-foreground mt-2">
            A comprehensive guide to DevOps interview questions with detailed answers and AI practice
          </p>
        </div>

        <div className="space-y-8">
          {devopsQuestions.questions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    {index + 1}. {question.question}
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText(question.answer, question.id)}
                    >
                      <Volume2 className={`w-4 h-4 ${isSpeaking === question.id ? 'text-primary animate-pulse' : ''}`} />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Practice
                    </Button>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Topic: {question.topic}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {question.answer.split('\\n\\n').map((paragraph, i) => {
                      if (paragraph.includes(':')) {
                        const [title, ...content] = paragraph.split(':');
                        return (
                          <div key={i} className="mb-4">
                            <h3 className="text-base font-semibold mb-2">{title}:</h3>
                            <ul className="list-disc list-inside">
                              {content.join(':').split('\\n-').map((item, j) => (
                                item.trim() && <li key={j} className="ml-4">{item.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return <p key={i} className="mb-4">{paragraph}</p>;
                    })}
                  </div>
                </div>
              </div>
              {index < devopsQuestions.questions.length - 1 && (
                <Separator className="mt-6" />
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedQuestion && (
        <AIDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          question={selectedQuestion.question}
          correctAnswer={selectedQuestion.answer}
        />
      )}
    </div>
  );
}
