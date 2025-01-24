import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: string;
  job_post_id: string;
  user_id: string;
  status: 'pending' | 'selected' | 'rejected';
  created_at: string;
  applicant_name: string;
  applicant_email: string;
  applicant_resume_url: string;
  job_post: {
    job_title: string;
    company_name: string;
  };
}

export function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      console.log('Fetching applications...');
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_post:job_posts!fk_job_post (
            job_title,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      console.log('Fetched applications:', data);
      setApplications(data as Application[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
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

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{application.applicant_name}</p>
                      <p className="text-sm text-gray-500">{application.applicant_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{application.job_post?.job_title}</TableCell>
                  <TableCell>{application.job_post?.company_name}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={application.status}
                      onValueChange={(value) => 
                        updateApplicationStatus(
                          application.id, 
                          value as Application['status']
                        )
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {application.applicant_resume_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(application.applicant_resume_url, '_blank')}
                      >
                        View Resume
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}