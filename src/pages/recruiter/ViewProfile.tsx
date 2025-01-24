import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecruiterNavbar } from '@/components/recruiter/RecruiterNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Eye, Mail, Calendar, Phone } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  created_at: string;
}

const ViewProfile = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select(`
            *,
            profile:user_id (
              id,
              name,
              email,
              phone,
              resume_url,
              experience,
              skills,
              education,
              created_at
            )
          `)
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;
        if (application?.profile) {
          setProfile(application.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Could not load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchProfile();
    }
  }, [applicationId, toast]);

  const sendInterviewInvitation = async () => {
    try {
      // Create interview invitation
      const { error: inviteError } = await supabase
        .from('interview_invitations')
        .insert([
          {
            application_id: applicationId,
            user_id: profile?.id,
            status: 'pending',
            scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
          }
        ]);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Interview invitation sent successfully",
      });

      // Navigate to interview management page
      navigate(`/recruiter/interviews/${applicationId}`);
    } catch (error) {
      console.error('Error sending interview invitation:', error);
      toast({
        title: "Error",
        description: "Could not send interview invitation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <RecruiterNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <RecruiterNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Profile not found</div>
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
              <CardTitle className="text-2xl font-bold">Candidate Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Name:</span>
                      {profile.name}
                    </p>
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {profile.email}
                    </p>
                    {profile.phone && (
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {profile.phone}
                      </p>
                    )}
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
                  <div className="space-y-2">
                    {profile.experience && (
                      <div>
                        <span className="font-medium">Experience:</span>
                        <p>{profile.experience}</p>
                      </div>
                    )}
                    {profile.education && (
                      <div>
                        <span className="font-medium">Education:</span>
                        <p>{profile.education}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume */}
              {profile.resume_url && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Resume</h3>
                  <Button
                    variant="outline"
                    onClick={() => window.open(profile.resume_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  variant="default"
                  onClick={sendInterviewInvitation}
                >
                  Send Interview Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ViewProfile;
