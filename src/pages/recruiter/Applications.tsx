import { Applications } from "@/components/recruiter/Applications";

export default function ReApplications() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Job Applications
        </h1>
        <p className="text-gray-600 mt-2">Review and manage candidate applications</p>
      </div>
      <Applications />
    </div>
  );
}