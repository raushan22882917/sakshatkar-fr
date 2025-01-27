import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";

interface VideoFeedProps {
  isAI?: boolean;
  imageUrl: string;  // Avatar image URL
  apiKey: string;    // Groq API key for fetching responses
}

export function VideoFeed({ isAI = false, imageUrl, apiKey }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);

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
      const response = await fetch("YOUR_GROQ_API_URL", {
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

  // AI Introduction when the component mounts
  useEffect(() => {
    if (isAI) {
      speak("Hello, I am your AI Interviewer. How can I assist you today?");
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
  }, [isAI]);

  return (
    <Card className="relative w-[200px] h-[200px] bg-black rounded-lg overflow-hidden">
      {isAI ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <div className="text-center">
            <img src={imageUrl} alt="AI Avatar" className="w-16 h-16 mx-auto mb-4 rounded-full" />
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
