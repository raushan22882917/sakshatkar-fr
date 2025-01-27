import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Mentor } from '@/types/mentorship';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Users, Briefcase, GraduationCap, Clock, Calendar as CalendarIcon } from 'lucide-react';

export function MentorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            company_name
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Mentor;
    }
  });

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
  ];

  const handleBooking = () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    navigate('/mentorship/payment', {
      state: {
        mentor,
        selectedDate,
        selectedTimeSlot
      }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!mentor) {
    return <div>Mentor not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Mentor Info */}
          <div className="md:w-2/3">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-4">
                <img
                  src={mentor.profile_image_url || '/placeholder.svg'}
                  alt={mentor.profiles?.name || 'Mentor'}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-2xl">{mentor.profiles?.name}</CardTitle>
                  <div className="flex items-center text-yellow-500 mt-2">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-lg">{mentor.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="about">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="expertise">Expertise</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="mt-4">
                    <p className="text-gray-600 dark:text-gray-400">{mentor.bio}</p>
                    <div className="flex items-center mt-4 space-x-6 text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        <span>{mentor.total_sessions} sessions completed</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        <span>${mentor.hourly_rate}/hour</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="expertise" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Areas of Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.map((exp, index) => (
                            <Badge key={index} variant="secondary">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="experience" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Briefcase className="w-5 h-5 mt-1" />
                        <div>
                          <h3 className="font-medium">Current Position</h3>
                          <p className="text-gray-600">{mentor.profiles?.company_name || 'Independent Mentor'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <GraduationCap className="w-5 h-5 mt-1" />
                        <div>
                          <h3 className="font-medium">Mentoring Goals</h3>
                          <ul className="list-disc list-inside text-gray-600">
                            {mentor.mentoring_goals.map((goal, index) => (
                              <li key={index}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Select Date</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) =>
                        date < new Date() || date > new Date(Date.now() + 12096e5)
                      }
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Select Time Slot</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className="w-full"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTimeSlot}
                  >
                    Book Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDetails;
