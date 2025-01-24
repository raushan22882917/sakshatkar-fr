import { JobPostForm } from "@/components/recruiter/JobPostForm";

export default function ReNewJobPost() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Post a New Job
        </h1>
        <p className="text-gray-600 mt-2">Create a new job posting to find the perfect candidate</p>
      </div>
      <JobPostForm />
    </div>
  );
}
