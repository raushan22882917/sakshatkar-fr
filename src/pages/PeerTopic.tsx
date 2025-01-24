import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, FileText, Tag, Clock, Award, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { peerQuestions } from "@/data/peer_question";
import { Navbar } from "@/components/Navbar";

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  tags: string[];
}

interface TopicDetails {
  id: number;
  title: string;
  description: string;
  challenges: Challenge[];
}

export default function PeerTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<TopicDetails | null>(null);

  useEffect(() => {
    // Get topic details and challenges from the imported data
    const topicData = peerQuestions.find(t => t.id === Number(id));
    if (topicData) {
      setTopic({
        id: topicData.id,
        title: topicData.title,
        description: topicData.description,
        challenges: topicData.questions || []
      });
    }
  }, [id]);

  const handleSolveChallenge = (challengeId: number) => {
    navigate(`/peer-practice/solve/${challengeId}`);
  };

  const handleBack = () => {
    navigate('/peer-practice');
  };

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">{topic.title}</h1>
            </div>
            <p className="text-muted-foreground">{topic.description}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {topic.challenges.map((challenge) => (
            <Card key={challenge.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">{challenge.title}</h3>
                  </div>

                  <p className="text-muted-foreground">{challenge.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {challenge.timeLimit} mins
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Award className="h-4 w-4 mr-1" />
                      {challenge.difficulty}
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => handleSolveChallenge(challenge.id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Solve Challenge
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
