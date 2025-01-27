import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import WaveSurfer from "wavesurfer.js";

interface Profile {
  name?: string;
}

interface VideoFeedProps {
  isAI?: boolean;
  apiKey: string; // Groq API key for fetching responses (from .env file)
}

export function VideoFeed({ isAI = false, apiKey }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null); // Reference for waveform
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [waveSurferInstance, setWaveSurferInstance] = useState<WaveSurfer | null>(null);

  // Initialize the WaveSurfer instance
  useEffect(() => {
    if (waveformRef.current) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ffeb3b", // Yellow color for waveform
        progressColor: "#ffffff", // White color for waveform progress
        height: 80,
        barWidth: 3,
        barHeight: 1,
      });
      setWaveSurferInstance(ws);
    }
  }, []);

  // Function to make AI speak
  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0]; // Set voice (default first voice)
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
    
    // Play the audio for waveform visualization
    const audio = new Audio();
    audio.src = `data:audio/wav;base64,${btoa(text)}`; // Placeholder, replace with actual audio data
    audio.play();
    waveSurferInstance?.load(audio.src); // Load the AI's response for waveform
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

    startListening(); // Start listening for the user's questions when the component mounts
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
      {/* Waveform display */}
      <div ref={waveformRef} className="absolute bottom-0 left-0 w-full"></div>
    </Card>
  );
}

export default VideoFeed;
