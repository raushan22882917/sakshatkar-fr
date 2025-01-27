import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  name?: string;
}

interface VideoFeedProps {
  isAI?: boolean;
  apiKey: string; // Groq API key for fetching responses (from .env file)
}

export function VideoFeed({ isAI = false, apiKey }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Function to make AI speak
  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0]; // Set voice (default first voice)
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);

    // Lip-sync with DeepMotion API (optional, if you have integration)
    animateAvatar(text);
  };

  // Function to trigger DeepMotion API for lip sync animation
  const animateAvatar = async (text: string) => {
    try {
      const response = await fetch("YOUR_DEEPMOTION_API_URL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_DEEPMOTION_API_KEY`,
        },
        body: JSON.stringify({ text }), // Send the text to DeepMotion for lip-syncing
      });
      const data = await response.json();
      console.log("Avatar animation response:", data);
      // Use the data to trigger animations for your avatar
    } catch (err) {
      console.error("Error in avatar animation:", err);
    }
  };

  // Fetch AI response from Groq API
  const fetchAIResponse = async (query: string) => {
    try {
      const response = await fetch(process.env.VITE_GROQ_API_KEY || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResponse(data.answer); // Assuming the API response contains an 'answer' field
      speak(data.answer); // Speak the AI's response
    } catch (err) {
      console.error("Error fetching AI response:", err);
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
      fetchAIResponse(query); // Fetch response from AI based on the user's query
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
      speak(`Hello, ${userName}! I am your AI Interviewer. How can I assist you today?`);
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
