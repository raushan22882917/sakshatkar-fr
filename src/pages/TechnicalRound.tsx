import { useState, useRef, useEffect } from 'react';
import { interviewTopics } from '../data/interviewTopics';
import { interviewQuestions, Question } from '../data/interviewQuestions';
import { evaluateAnswer, EvaluationResult } from '../services/groqService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Code2, Database, Cloud, Brain, GitBranch, TestTube, Cpu, Network, Kanban, Zap, Shield, Binary, Mic, MicOff, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TopicIconProps {
  topic: string;
}

const TopicIcon = ({ topic }: TopicIconProps) => {
  const icons = {
    "Data Structures and Algorithms": Binary,
    "System Design": Code2,
    "Object-Oriented Programming (OOP)": Code2,
    "Databases": Database,
    "Cloud and Distributed Systems": Cloud,
    "Machine Learning and AI": Brain,
    "Version Control (Git)": GitBranch,
    "Testing and Debugging": TestTube,
    "Concurrency and Multithreading": Cpu,
    "API Design and Web Services": Network,
    "Software Development Methodologies": Kanban,
    "Performance Optimization": Zap,
    "Security": Shield,
  };

  const IconComponent = icons[topic as keyof typeof icons] || Code2;
  return <IconComponent className="h-8 w-8 text-muted-foreground" />;
};

export default function TechnicalRound() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const currentQuestions = selectedTopic && selectedSubTopic 
    ? (interviewQuestions[selectedTopic as keyof typeof interviewQuestions]?.[selectedSubTopic] || [])
    : [];
  
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const audioChunks: BlobPart[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        try {
          // Here you would send the audio to a speech-to-text service
          // For now, we'll just show a toast
          toast({
            title: "Speech Recorded",
            description: "Speech-to-text conversion would happen here",
          });
        } catch (error) {
          console.error('Error processing speech:', error);
          toast({
            title: "Error",
            description: "Failed to process speech",
            variant: "destructive",
          });
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim()) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer(currentQuestion, answer);
      setEvaluation(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate answer",
        variant: "destructive",
      });
    }
    setIsEvaluating(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer("");
      setEvaluation(null);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && isRecording) {
        stopRecording();
      }
    };
  }, []);

  return (
    <div className="container mx-auto py-6">
      {!selectedTopic ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(interviewTopics).map(([topic]) => (
            <Card key={topic} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <TopicIcon topic={topic} />
                <div>
                  <CardTitle className="text-lg">{topic}</CardTitle>
                  <CardDescription>
                    {interviewTopics[topic as keyof typeof interviewTopics].length} subtopics
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => setSelectedTopic(topic)}
                >
                  Start Practice <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Panel - Subtopics */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TopicIcon topic={selectedTopic} />
                <span>{selectedTopic}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh]">
                {interviewTopics[selectedTopic as keyof typeof interviewTopics].map((subtopic) => (
                  <div key={subtopic}>
                    <Button
                      variant={selectedSubTopic === subtopic ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedSubTopic(subtopic)}
                    >
                      {subtopic}
                    </Button>
                    <Separator className="my-1" />
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Panel - Practice Interface */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Practice Interview</CardTitle>
              <CardDescription>
                {selectedSubTopic ? `${selectedTopic} > ${selectedSubTopic}` : 'Select a subtopic to start practicing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSubTopic && currentQuestion ? (
                <div className="space-y-4">
                  {/* Question Section */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}/{currentQuestions.length}:</h3>
                      <span className="text-sm text-muted-foreground">
                        Difficulty: {currentQuestion.difficulty}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{currentQuestion.question}</p>
                  </div>

                  {/* Answer Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Your Answer:</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={isRecording ? "destructive" : "outline"}
                          onClick={isRecording ? stopRecording : startRecording}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[200px]"
                    />
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isEvaluating || !answer.trim()}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Answer
                    </Button>
                  </div>

                  {/* Evaluation Section */}
                  {evaluation && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Evaluation:</h3>
                        <div className="flex items-center gap-4">
                          <Progress value={(evaluation.score / currentQuestion.maxScore) * 100} />
                          <span className="text-sm font-medium">
                            {evaluation.score}/{currentQuestion.maxScore} points
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Strengths:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {evaluation.feedback.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {evaluation.feedback.improvements.map((improvement, i) => (
                              <li key={i}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Detailed Feedback:</h4>
                        <p className="text-sm text-muted-foreground">{evaluation.detailedFeedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => {
                      setSelectedSubTopic(null);
                      setSelectedTopic(null);
                      setCurrentQuestionIndex(0);
                      setAnswer("");
                      setEvaluation(null);
                    }}>
                      Back to Topics
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={currentQuestionIndex >= currentQuestions.length - 1}
                    >
                      Next Question
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a subtopic from the left panel to start practicing
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}