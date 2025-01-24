import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getInterviewList, updateInterviewStatus } from "@/services/interviewService";
import { Interview } from "@/types/interview";

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getInterviewList();
        setInterviews(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch interviews.",
          variant: "destructive",
        });
      }
    };

    fetchInterviews();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateInterviewStatus(id, status);
      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === id ? { ...interview, status } : interview
        )
      );
      toast({
        title: "Success",
        description: "Interview status updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interview status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Interviews</h1>
      <div className="grid grid-cols-1 gap-4">
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-4">
            <h2 className="text-lg font-semibold">{interview.title}</h2>
            <p className="text-sm text-gray-600">{interview.date}</p>
            <p className="text-sm">{interview.status}</p>
            <div className="mt-2">
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(interview.id, 'completed')}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(interview.id, 'cancelled')}
                className="ml-2"
              >
                Cancel Interview
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
