import { PracticeModeCard } from "@/components/PracticeModeCard";
import { AptitudeTestCard } from "@/components/interview/AptitudeTestCard";
import { UserCog, Code, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AptitudeTest } from "@/types/aptitude";

const sampleTest: AptitudeTest = {
  id: "1",
  company: "TCS",
  title: "TCS NQT Practice Test",
  description: "Comprehensive practice test for TCS NQT examination",
  duration: 180,
  totalQuestions: 100,
  categories: {
    quantitative: 30,
    logical: 30,
    verbal: 20,
    coding: 20
  },
  difficulty: "Medium",
  completionRate: 0,
};

export default function InterviewRounds() {
  const navigate = useNavigate();

  const rounds = [
    {
      title: "Resume Based Question",
      description: "Prepare for HR interviews by practicing common questions and scenarios.",
      icon: UserCog,
      route: "/hr-interview",
      image: "https://media.gettyimages.com/id/1365436662/photo/successful-partnership.jpg?s=612x612&w=0&k=20&c=B1xspe9Q5WMsLc7Hc9clR8MWUL4bsK1MfUdDNVNR2Xg=",
    },
    {
      title: "HR Round Simulation",
      description: "Practice common HR interview questions and scenarios.",
      icon: UserCog,
      route: "/hr-intewrview",
      image: "https://media.gettyimages.com/id/1365436662/photo/successful-partnership.jpg?s=612x612&w=0&k=20&c=B1xspe9Q5WMsLc7Hc9clR8MWUL4bsK1MfUdDNVNR2Xg=",
    },
    {
      title: "Technical Round Simulation",
      description: "Sharpen your technical skills with simulated problem-solving sessions.",
      icon: Code,
      route: "/technical-round",
      image: "",
    },
    {
      title: "Aptitude Test Preparation",
      description: "Practice company-specific aptitude tests to improve your performance.",
      icon: Target,
      route: "/aptitude-test",
      image: "",
    }
  ];

  const handleStartTest = (testId: string) => {
    navigate(`/aptitude-test/${testId}`);
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Interview Rounds</h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rounds.map((round) => (
          <PracticeModeCard key={round.title} {...round} />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Featured Aptitude Tests</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AptitudeTestCard 
            test={sampleTest}
            onStart={handleStartTest}
          />
        </div>
      </div>
    </div>
  );
}