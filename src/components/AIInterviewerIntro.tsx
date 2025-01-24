import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

export interface AIInterviewerIntroProps {
  isLoading: boolean;
  onIntroComplete: (analysisJson: string) => Promise<void>;
}

export function AIInterviewerIntro({
  isLoading,
  onIntroComplete
}: AIInterviewerIntroProps) {
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const totalQuestions = 10;
  const questionCategories = [
    "Introduction and Background",
    "Experience and Projects",
    "Technical Skills",
    "Problem-Solving",
    "Behavioral and Cultural Fit"
  ];

  useEffect(() => {
    const introduceInterviewer = async () => {
      try {
        setIsReading(true);
        const introText = `Hi there! I'm Sarah, your AI Interview Assistant. 
        
        I'm excited to guide you through this interview process! I specialize in conducting personalized interviews that help showcase your unique skills and experiences.
        
        Before we begin, I'd love to learn more about you. Could you please share your resume or a brief introduction? This will help me tailor our conversation to your background and ensure we have a meaningful discussion.
        
        Don't worry - I'm here to help you succeed, not to stress you out! We'll take this step by step, and I'll make sure you're comfortable throughout the process.

        Ready to get started?`;

        // Try browser's built-in speech synthesis first
        if ('speechSynthesis' in window) {
          try {
            const utterance = new SpeechSynthesisUtterance(introText);
            utterance.rate = 0.9; // Slightly slower for better clarity
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Get a female voice if available
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.name.includes('female') || voice.name.includes('Female'));
            if (femaleVoice) {
              utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
              setIsReading(false);
              setShowTextarea(true);
            };

            utterance.onerror = (event) => {
              console.error('Speech synthesis error:', event);
              setIsReading(false);
              setShowTextarea(true);
              toast({
                title: "Notice",
                description: "Audio playback not available. You can proceed with the text interface.",
                variant: "default"
              });
            };

            window.speechSynthesis.speak(utterance);
            return;
          } catch (error) {
            console.error('Speech synthesis error:', error);
          }
        }

        // Fallback to Eleven Labs if available
        const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
        
        if (ELEVEN_LABS_API_KEY) {
          try {
            const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVEN_LABS_API_KEY
              },
              body: JSON.stringify({
                text: introText,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75
                }
              })
            });

            if (!response.ok) throw new Error('Failed to generate speech');

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.onended = () => {
              setIsReading(false);
              setShowTextarea(true);
              URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
              setIsReading(false);
              setShowTextarea(true);
              URL.revokeObjectURL(audioUrl);
              toast({
                title: "Notice",
                description: "Audio playback not available. You can proceed with the text interface.",
                variant: "default"
              });
            };

            await audio.play();
          } catch (error) {
            console.error('Eleven Labs API error:', error);
            setIsReading(false);
            setShowTextarea(true);
            toast({
              title: "Notice",
              description: "Audio playback not available. You can proceed with the text interface.",
              variant: "default"
            });
          }
        } else {
          // If no audio options are available, just show the text
          setIsReading(false);
          setShowTextarea(true);
        }
      } catch (error) {
        console.error('Error in introduceInterviewer:', error);
        setIsReading(false);
        setShowTextarea(true);
        toast({
          title: "Notice",
          description: "Proceeding with text interface.",
          variant: "default"
        });
      }
    };

    introduceInterviewer();
  }, [toast]);

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Error",
        description: "Please paste your resume text first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setGeneratedQuestions(0);
    try {
      setAnalysisStep("Analyzing resume content...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      const systemPrompt = `You are an expert HR interviewer. Analyze the following resume and create personalized interview questions in these categories:

1. Introduction and Background (2 questions):
   - Questions about career goals, motivation, and professional journey
   - Focus on understanding the candidate's background and aspirations

2. Experience and Projects (2 questions):
   - Specific questions about projects mentioned in the resume
   - Questions about challenges faced and solutions implemented
   - Focus on understanding their role and contributions

3. Technical Skills (2 questions):
   - Questions testing proficiency in mentioned technologies
   - Scenario-based questions related to their tech stack
   - Questions about learning new technologies

4. Problem-Solving and Critical Thinking (2 questions):
   - Situational questions based on their experience
   - Questions about handling technical challenges
   - Focus on their approach to problem-solving

5. Behavioral and Cultural Fit (2 questions):
   - Questions about teamwork and collaboration
   - Questions about handling conflicts or difficult situations
   - Focus on communication and interpersonal skills

Format the response as JSON with these arrays:
{
  "introductionQuestions": [
    {"question": "..."},
    {"question": "..."}
  ],
  "experienceQuestions": [
    {"question": "..."},
    {"question": "..."}
  ],
  "technicalQuestions": [
    {"question": "..."},
    {"question": "..."}
  ],
  "problemSolvingQuestions": [
    {"question": "..."},
    {"question": "..."}
  ],
  "behavioralQuestions": [
    {"question": "..."},
    {"question": "..."}
  ]
}`;

      setAnalysisStep("Generating personalized questions...");

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
              content: resumeText
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 2000,
          stream: false // Disabled streaming for more reliable response
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Failed to analyze resume'}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(data.choices[0].message.content);
        
        // Validate the response format
        const requiredCategories = [
          'introductionQuestions',
          'experienceQuestions',
          'technicalQuestions',
          'problemSolvingQuestions',
          'behavioralQuestions'
        ];

        const isValidFormat = requiredCategories.every(category => 
          Array.isArray(parsedQuestions[category]) && 
          parsedQuestions[category].length === 2 &&
          parsedQuestions[category].every(q => typeof q.question === 'string')
        );

        if (!isValidFormat) {
          throw new Error('Invalid question format in response');
        }

        // Update progress as we validate each category
        requiredCategories.forEach((_, index) => {
          setGeneratedQuestions((index + 1) * 2);
          setAnalysisStep(`Validating ${questionCategories[index]} questions...`);
        });

      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse API response');
      }

      setAnalysisStep("Finalizing analysis...");
      await new Promise(resolve => setTimeout(resolve, 500));

      onIntroComplete(parsedQuestions);
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg" />
      <Card className="relative bg-background/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
        <div className="flex flex-col items-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse opacity-50" />
                <Avatar className="w-16 h-16 border-2 border-white relative z-10">
                  <AvatarImage src="/assets/ai-avatar.png" alt="AI Interviewer" className="rounded-full" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    AI
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  Sarah - AI Interview Assistant
                </CardTitle>
                <CardDescription>
                  Professional • Friendly • Here to help
                </CardDescription>
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <AnimatePresence mode="wait">
              {isReading ? (
                <motion.div
                  key="reading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center space-x-2 text-gray-600"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sarah is introducing herself...</span>
                </motion.div>
              ) : showTextarea ? (
                <motion.div
                  key="textarea"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <p className="text-lg text-gray-600">
                    Please paste your resume text below for analysis:
                  </p>
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your resume text here..."
                      className="min-h-[300px] text-base p-4"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    <Upload className="absolute top-4 right-4 text-gray-400" />
                  </div>

                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-600">{analysisStep}</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(generatedQuestions / totalQuestions) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Generated {generatedQuestions} of {totalQuestions} questions
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={analyzeResume}
                      disabled={!resumeText.trim()}
                      className="w-full h-12 text-lg"
                    >
                      Start Interview
                    </Button>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
}
