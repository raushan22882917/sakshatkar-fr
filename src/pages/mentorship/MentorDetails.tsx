import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Mentor } from "@/types/mentorship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Mail, MapPin, Star, Users } from "lucide-react";

export default function MentorDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorDetails();
  }, [id]);

  const fetchMentorDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select(`
          *,
          profile:profiles(name, email, company_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setMentor(data);
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Mentor not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {mentor.profile_image_url && (
              <img
                src={mentor.profile_image_url}
                alt={mentor.profile?.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <CardTitle className="text-2xl">{mentor.profile?.name}</CardTitle>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {mentor.profile?.company_name}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{mentor.bio}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>{mentor.rating} / 5 ({mentor.total_sessions} sessions)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Max group size: {mentor.max_group_size}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{mentor.availability}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>{mentor.profile?.email}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>1-on-1 Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${mentor.one_on_one_price}/hr</p>
                <Button className="w-full mt-4">Book 1-on-1 Session</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${mentor.group_price}/hr</p>
                <Button className="w-full mt-4">Join Group Session</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}