import { RecruiterLayout } from "@/components/recruiter/RecruiterLayout";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    resume_url: string;
    profile_image: string;
  };
  job_post: {
    job_title: string;
    company_name: string;
  };
}

export function ReApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          user_id,
          status,
          created_at,
          user:profiles(
            first_name,
            last_name,
            email,
            phone,
            resume_url,
            profile_image
          ),
          job_post:job_posts(
            job_title,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(applications || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });

      loadApplications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Job Applications
          </h1>
          <p className="text-gray-600 mt-2">Review and manage candidate applications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.job_id}</TableCell>
                    <TableCell>{application.job_post?.job_title}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setIsProfileOpen(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {application.user?.first_name} {application.user?.last_name}
                      </button>
                    </TableCell>
                    <TableCell>{formatDate(application.created_at)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(application.status)}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Applicant Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Applicant Profile</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedApplication.user?.profile_image && (
                    <img
                      src={selectedApplication.user.profile_image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedApplication.user?.first_name} {selectedApplication.user?.last_name}
                    </h3>
                    <p className="text-gray-600">{selectedApplication.user?.email}</p>
                    {selectedApplication.user?.phone && (
                      <p className="text-gray-600">{selectedApplication.user?.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Applied Position</h4>
                  <p>{selectedApplication.job_post?.job_title} at {selectedApplication.job_post?.company_name}</p>
                </div>

                {selectedApplication.user?.resume_url && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Resume</h4>
                    <Button asChild>
                      <a
                        href={selectedApplication.user.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold">Application Status</h4>
                  <Badge className={getStatusBadgeColor(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RecruiterLayout>
  );
}
