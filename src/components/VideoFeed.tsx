import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  name?: string;
}

interface VideoFeedProps {
  isAI?: boolean;
}

export function VideoFeed({ isAI = false }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to get AI response using Groq
  const getAIResponse = async (question: string) => {
    try {
      const response = await fetch('https://api.groq.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: question }],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  };

  // Function to animate avatar using D-ID
  const animateAvatar = async (text: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${import.meta.env.VITE_DID_API}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: text,
          },
          source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.png',
          config: {
            stitch: true,
          },
        }),
      });

      const { id } = await response.json();
      
      // Poll for the result
      const result = await pollForResult(id);
      if (result?.result_url) {
        if (videoRef.current) {
          videoRef.current.src = result.result_url;
          videoRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error in avatar animation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to poll for D-ID result
  const pollForResult = async (id: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.d-id.com/talks/${id}`, {
        headers: {
          'Authorization': `Basic ${import.meta.env.VITE_DID_API}`,
        },
      });
      
      const result = await response.json();
      
      if (result.status === 'done') {
        return result;
      } else if (result.status === 'error') {
        throw new Error('D-ID processing failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Polling timeout');
  };

  // Function to handle user question
  const handleUserQuestion = async (question: string) => {
    try {
      setIsProcessing(true);
      const aiResponse = await getAIResponse(question);
      setResponse(aiResponse);
      await animateAvatar(aiResponse);
    } catch (error) {
      console.error('Error processing question:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start listening for user's speech input
  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const query = event.results[0][0].transcript;
      console.log("User said:", query);
      handleUserQuestion(query); // Handle user question
    };

    recognition.onend = () => {
      setIsListening(false); // Listening ends when the user stops speaking
    };
  };

  // Request permission for audio access
  const requestAudioPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Audio permission granted");
      startListening(); // Start listening after permission is granted
    } catch (err) {
      console.error("Audio permission denied:", err);
    }
  };

  // Fetch user name from Supabase when component mounts
  useEffect(() => {
    const fetchUserName = async () => {
      const { data, error } = await supabase
        .from<Profile>("profiles")
        .select("name")
        .single();

      if (error) {
        console.error("Error fetching user name:", error.message);
      } else {
        setUserName(data?.name || "User");
      }
    };

    fetchUserName();

    if (isAI && userName) {
      handleUserQuestion(`Hello, ${userName}! I am your AI Interviewer. How can I assist you today?`);
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }

    requestAudioPermission(); // Request audio permission when the component mounts
  }, [isAI, userName]);

  return (
    <Card className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {isAI ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <div className="text-center">
            <img
              src="/sarah.jpg" // Reference image from the public directory
              alt="AI Avatar"
              className="w-full h-full object-cover rounded-lg"
            />
            <p className="text-sm text-muted-foreground">AI Interviewer</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </Card>
  );
}

export default VideoFeed;
