import { useEffect, useRef } from "react";
import { Card } from "./ui/card";

interface VideoFeedProps {
  isAI?: boolean;
}

export function VideoFeed({ isAI = false }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
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
