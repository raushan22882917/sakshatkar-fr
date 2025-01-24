import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { getJobs, deleteJob } from "@/services/jobService";
import { Job } from "@/types/job";

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobList = await getJobs();
        setJobs(jobList);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch jobs.",
          variant: "destructive",
        });
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast({
        title: "Success",
        description: "Job deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.description}</td>
                <td>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Jobs;
