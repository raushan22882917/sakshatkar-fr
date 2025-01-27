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

  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0]; // Set voice (default first voice)
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
    
    // Lip-sync with DeepMotion API
    animateAvatar(text);
  };

  const animateAvatar = async (text: string) => {
    // Here, you'd interact with the DeepMotion API to trigger lip sync animation
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

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const query = event.results[0][0].transcript;
      console.log("User said:", query);
      fetchAIResponse(query);
    };

    recognition.onend = () => {
      setIsListening(false); // Listening ends when the user stops speaking
    };
  };

  useEffect(() => {
    if (!isAI) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }
  }, [isAI]);

  return (
    <Card className="relative w-[200px] h-[200px] bg-black rounded-lg overflow-hidden">
      {isAI ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <div className="text-center">
            <img src="/sarah.jpg" alt="AI Avatar" className="w-16 h-16 mx-auto mb-4 rounded-full" />
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

      {/* User Voice Interaction */}
      <div className="absolute bottom-0 w-full p-4 text-center">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`p-2 ${isListening ? 'bg-gray-500' : 'bg-purple-500'} text-white rounded`}
        >
          {isListening ? "Listening..." : "Ask AI (Speak Now)"}
        </button>
      </div>
    </Card>
  );
}

export default VideoFeed;
