import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RecruiterNavbar } from '@/components/recruiter/RecruiterNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Video, Mail } from "lucide-react";

interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  scheduled_date: string;
  meeting_link?: string;
  notes?: string;
  user: {
    name: string;
    email: string;
  };
}

const Interviews = () => {
  const { applicationId } = useParams();
  const { toast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data, error } = await supabase
          .from('interview_invitations')
          .select(`
            *,
            user:user_id (
              name,
              email
            )
          `)
          .eq('application_id', applicationId)
          .single();

        if (error) throw error;
        if (data) {
          setInterview(data);
          setDate(new Date(data.scheduled_date));
          setMeetingLink(data.meeting_link || '');
          setNotes(data.notes || '');
        }
      } catch (error) {
        console.error('Error fetching interview:', error);
        toast({
          title: "Error",
          description: "Could not load interview data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchInterview();
    }
  }, [applicationId, toast]);

  const updateInterview = async () => {
    if (!interview || !date) return;

    try {
      const { error } = await supabase
        .from('interview_invitations')
        .update({
          scheduled_date: date.toISOString(),
          meeting_link: meetingLink,
          notes: notes,
        })
        .eq('id', interview.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview details updated successfully",
      });

      // Send email notification to candidate
      await supabase.functions.invoke('send-interview-notification', {
        body: {
          email: interview.user.email,
          name: interview.user.name,
          date: format(date, 'PPP'),
          time: format(date, 'p'),
          meetingLink,
        },
      });

    } catch (error) {
      console.error('Error updating interview:', error);
      toast({
        title: "Error",
        description: "Could not update interview details",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <RecruiterNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading interview details...</div>
        </main>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <RecruiterNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Interview not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RecruiterNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Interview Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Candidate Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Candidate Information</h3>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Name:</span>
                    {interview.user.name}
                  </p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {interview.user.email}
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Status:</span>
                    <Badge
                      variant={
                        interview.status === 'accepted' ? 'success' :
                        interview.status === 'rejected' ? 'destructive' :
                        interview.status === 'completed' ? 'default' :
                        'secondary'
                      }
                    >
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Interview Schedule</h3>
                <div className="flex flex-col space-y-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Meeting Details</h3>
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <Input
                    placeholder="Enter meeting link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Interview Notes</h3>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Add notes about the interview..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="default"
                  onClick={updateInterview}
                >
                  Update Interview Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Interviews;
