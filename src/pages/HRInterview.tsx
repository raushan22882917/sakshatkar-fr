import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function HRInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startInterview = async () => {
    if (!companyName || !position) {
      toast({
        title: "Missing Information",
        description: "Please provide both company name and position",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsStarting(true);

      // Request camera and microphone permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
      } catch (mediaError) {
        toast({
          title: "Permission Error",
          description: "Please allow camera and microphone access to start the interview",
          variant: "destructive"
        });
        setIsStarting(false);
        return;
      }
      
      // Create interview record in Supabase
      const { data: interview, error } = await supabase
        .from('hr_interviews')
        .insert([
          {
            user_id: user?.id,
            company_name: companyName,
            position: position,
            status: 'in_progress',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Database Error",
          description: "Failed to create interview record. Please try again.",
          variant: "destructive"
        });
        throw error;
      }

      if (!interview) {
        throw new Error('No interview data returned');
      }

      // Navigate to interview session with interview ID
      navigate(`/hr-interview-session/${interview.id}`);
    } catch (error) {
      console.error('Start interview error:', error);
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              HR Interview Simulation
            </h1>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Enter target company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Enter target position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={startInterview}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
            </div>
          </div>

          {mediaStream && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}