import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AIInterviewerIntro } from "@/components/AIInterviewerIntro";
import { InterviewQuestionCard } from "@/components/InterviewQuestionCard";
import { InterviewResultsDialog } from "@/components/InterviewResultsDialog";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Check, Upload, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjs from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Question {
  id: string;
  question: string;
  category: 'Introduction' | 'Experience' | 'Technical' | 'ProblemSolving' | 'Behavioral';
  context?: string;
  completed?: boolean;
  response?: string;
  score?: number;
}

interface UserProfile {
  name: string;
}

const MAX_TIME_SECONDS = 1200; // 20 minutes

export default function HRInterviewSession() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [introCompleted, setIntroCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (!id) {
      navigate('/hr-interview');
      return;
    }
    // Initialize interview with the ID
    initializeInterview(id);
  }, [id, navigate]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;

        speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setCurrentResponse(transcript);
        };

        speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          toast({
            title: "Error",
            description: "Failed to record speech. Please try again.",
            variant: "destructive"
          });
        };
      }
    }
  }, [toast]);

  const initializeInterview = async (interviewId: string) => {
    try {
      setIsLoading(true);
      
      const defaultQuestions: Question[] = [
        {
          id: '1',
          question: "Tell me about yourself and your background.",
          category: 'Introduction'
        },
        {
          id: '2',
          question: "What interests you about this position?",
          category: 'Experience'
        },
        {
          id: '3',
          question: "How do you handle challenging situations at work?",
          category: 'Behavioral'
        },
        {
          id: '4',
          question: "Can you describe a project you're particularly proud of?",
          category: 'Technical'
        },
        {
          id: '5',
          question: "How do you approach problem-solving in your work?",
          category: 'ProblemSolving'
        }
      ];

      setQuestions(defaultQuestions);
      setCurrentQuestionIndex(0);
      setCurrentStep("intro");
      setIntroCompleted(false);
      setCurrentResponse("");
      setFeedback(null);
      
    } catch (error) {
      console.error('Error initializing interview:', error);
      toast({
        title: "Error",
        description: "Failed to initialize interview. Please try again.",
        variant: "destructive"
      });
      navigate('/hr-interview');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice synthesis
  const speakText = async (text: string) => {
    setIsAISpeaking(true);
    try {
      const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
      
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVEN_LABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to generate speech');

      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => setIsAISpeaking(false);
      await audio.play();
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsAISpeaking(false);
    }
  };

  // Ask current question using voice
  const askCurrentQuestion = useCallback(() => {
    if (currentQuestion) {
      const categoryIntro = `This is a ${currentQuestion.category} question.`;
      speakText(`${categoryIntro} ${currentQuestion.question}`);
    }
  }, [currentQuestion]);

  // Handle question response
  const handleNextQuestion = useCallback(() => {
    if (!currentResponse.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer before continuing",
        variant: "destructive"
      });
      return;
    }

    setQuestions(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        completed: true,
        response: currentResponse
      };
      return updated;
    });

    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse("");
      setTimeout(askCurrentQuestion, 1000);
    }
  }, [currentQuestionIndex, currentResponse, isLastQuestion, askCurrentQuestion, toast]);

  // Submit interview and get feedback
  const submitInterview = async () => {
    if (!currentResponse.trim()) {
      toast({
        title: "Error",
        description: "Please answer the current question before submitting",
        variant: "destructive"
      });
      return;
    }

    // Save the last response
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        completed: true,
        response: currentResponse
      };
      return updated;
    });

    setIsSubmitting(true);
    try {
      const interviewData = questions.map(q => ({
        category: q.category,
        question: q.question,
        response: q.response || currentResponse
      }));

      const systemPrompt = `You are an expert HR interviewer. Analyze the following interview responses and provide detailed feedback. Consider:
1. Communication skills and clarity of responses
2. Technical knowledge and problem-solving ability
3. Experience and project contributions
4. Cultural fit and behavioral aspects
5. Areas of strength and improvement

Provide the feedback in this format:
{
  "overallAssessment": "Brief overall assessment",
  "strengths": ["List of key strengths"],
  "areasForImprovement": ["List of areas to improve"],
  "categoryFeedback": {
    "technical": "Feedback on technical responses",
    "behavioral": "Feedback on behavioral responses",
    "experience": "Feedback on experience responses"
  },
  "recommendation": "Final recommendation"
}`;

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
              content: systemPrompt
            },
            {
              role: "user",
              content: JSON.stringify(interviewData)
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate feedback");

      const result = await response.json();
      const feedbackData = JSON.parse(result.choices[0].message.content);
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Feedback generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview feedback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle interview completion
  const handleInterviewComplete = async () => {
    try {
      setIsSubmitting(true);
      
      const results = {
        interviewId: id,
        questions: questions.map(q => ({
          question: q.question,
          response: q.response || '',
          category: q.category
        })),
        completedAt: new Date().toISOString()
      };

      // Save results
      localStorage.setItem(`interview_${id}`, JSON.stringify(results));

      toast({
        title: "Interview Completed",
        description: "Your responses have been saved successfully.",
      });

      // Navigate to results or summary page
      navigate(`/hr-interview`);
    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        title: "Error",
        description: "Failed to save interview results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle question submission
  const handleQuestionSubmit = async () => {
    if (!currentQuestion || !currentResponse.trim()) return;

    try {
      setIsProcessing(true);

      // Update current question with response
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        response: currentResponse,
        completed: true
      };

      setQuestions(updatedQuestions);
      setFeedback("Response recorded successfully!");

      // Move to next question if not the last one
      if (!isLastQuestion) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setCurrentResponse("");
          setFeedback(null);
        }, 1500);
      } else {
        await handleInterviewComplete();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resume analysis completion
  const handleIntroComplete = async (analysisJson: string) => {
    try {
      setIsProcessing(true);
      
      // Parse the analysis result
      let parsedResult;
      try {
        parsedResult = typeof analysisJson === 'string' ? JSON.parse(analysisJson) : analysisJson;
      } catch (error) {
        console.error('Failed to parse analysis result:', error);
        throw new Error('Invalid analysis result format');
      }

      // Validate the structure of parsed result
      const requiredCategories = [
        'introductionQuestions',
        'experienceQuestions',
        'technicalQuestions',
        'problemSolvingQuestions',
        'behavioralQuestions'
      ];

      const categoryMapping = {
        introduction: 'Introduction',
        experience: 'Experience',
        technical: 'Technical',
        problemSolving: 'ProblemSolving',
        behavioral: 'Behavioral'
      } as const;

      type CategoryMappingType = typeof categoryMapping;
      type CategoryKeys = keyof CategoryMappingType;
      type CategoryValues = CategoryMappingType[CategoryKeys];

      // Validate all required categories exist
      const missingCategories = requiredCategories.filter(category => !parsedResult[category]);
      if (missingCategories.length > 0) {
        throw new Error(`Missing question categories: ${missingCategories.join(', ')}`);
      }

      // Transform questions into the required format
      const formattedQuestions: Question[] = [];
      
      for (const category of requiredCategories) {
        const categoryQuestions = parsedResult[category];
        
        if (!Array.isArray(categoryQuestions)) {
          throw new Error(`Invalid format for ${category}: expected array`);
        }

        categoryQuestions.forEach(q => {
          if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Invalid question format in ${category}`);
          }
          
          formattedQuestions.push({
            id: crypto.randomUUID(),
            question: q.question,
            category: categoryMapping[category.toLowerCase() as CategoryKeys] as CategoryValues
          });
        });
      }

      if (formattedQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      setQuestions(formattedQuestions);
      setIntroCompleted(true);
      setCurrentStep("questions");
      setTimeout(askCurrentQuestion, 1000);
      
    } catch (error) {
      console.error('Error processing interview questions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    try {
      let text = "";

      if (file.type === "application/pdf") {
        // Handle PDF files
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ");
        }
      } else if (file.type === "text/plain") {
        // Handle text files
        text = await file.text();
      } else if (file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // For Word documents, you might want to use a server-side solution
        toast({
          title: "Unsupported Format",
          description: "Word documents are not supported yet. Please upload a PDF or text file.",
          variant: "destructive"
        });
        return;
      }

      setResumeText(text);
      setCurrentResponse(text);
      toast({
        title: "Resume Uploaded",
        description: "Resume content has been extracted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error processing resume:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process the resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const toggleRecording = async () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      speechRecognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        await speechRecognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start speech recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const evaluateResponse = async (question: string, response: string) => {
    try {
      // Here you would typically call your AI service
      // For now, we'll use a simple scoring mechanism
      const wordCount = response.split(' ').length;
      const score = Math.min(Math.max(Math.floor(wordCount / 10), 1), 10);
      
      return {
        score,
        feedback: `Response received. Length: ${wordCount} words.`
      };
    } catch (error) {
      console.error('Error evaluating response:', error);
      return {
        score: 5,
        feedback: 'Could not evaluate response. Default score assigned.'
      };
    }
  };

  const handleQuestionSubmitWithEvaluation = async () => {
    if (!currentQuestion || !currentResponse.trim()) return;

    try {
      setIsProcessing(true);

      // Evaluate the response using AI
      const evaluation = await evaluateResponse(currentQuestion.question, currentResponse);
      
      // Update current question with response and score
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        response: currentResponse,
        completed: true,
        score: evaluation.score
      };

      setQuestions(updatedQuestions);
      setFeedback(evaluation.feedback);

      // Move to next question if not the last one
      if (!isLastQuestion) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setCurrentResponse("");
          setFeedback(null);
          // Speak the next question
          speakText(updatedQuestions[currentQuestionIndex + 1].question);
        }, 1500);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (!currentResponse.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer before continuing",
        variant: "destructive"
      });
      return;
    }

    setQuestions(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        completed: true,
        response: currentResponse
      };
      return updated;
    });

    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse("");
      setTimeout(askCurrentQuestion, 1000);
    } else {
      submitInterview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 relative">
        <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-lg shadow-xl" />
        
        <div className="relative z-10">
          {currentStep === "intro" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <AIInterviewerIntro
                onIntroComplete={handleIntroComplete}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300">
                        Interview Session
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {currentQuestion?.question}
                      </h3>
                      <Badge variant="secondary" className="text-sm dark:bg-gray-600 dark:text-gray-200">
                        {currentQuestion?.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold dark:text-gray-200">Your Response</Label>
                    <div className="relative">
                      <Textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Type your response here..."
                        className="min-h-[150px] bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm resize-none dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <Button
                          onClick={toggleRecording}
                          variant={isRecording ? "destructive" : "secondary"}
                          className="rounded-full w-12 h-12 p-0 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          {isRecording ? (
                            <Mic className="h-6 w-6 text-red-500 animate-pulse" />
                          ) : (
                            <Mic className="h-6 w-6" />
                          )}
                        </Button>
                        <Button
                          onClick={handleQuestionSubmitWithEvaluation}
                          disabled={!currentResponse.trim() || isProcessing}
                          className="px-6 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isLastQuestion ? (
                            "Finish Interview"
                          ) : (
                            "Next Question"
                          )}
                        </Button>
                      </div>
                    </div>
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 sticky top-0 bg-gray-50 dark:bg-gray-700/50 py-2">Feedback</h4>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback}</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          <InterviewResultsDialog
            open={showResults}
            onOpenChange={setShowResults}
            questions={questions}
            companyName={companyName}
            position={position}
          />
        </div>
      </div>
    </div>
  );
}