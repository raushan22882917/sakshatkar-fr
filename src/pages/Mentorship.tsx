import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Mentorship() {
  const navigate = useNavigate();
  const [discordUrl] = useState("https://discord.gg/your-discord-invite");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Join Our Tech Community
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with mentors, learn from peers, and grow together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Discord Community Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-500" />
                Join Our Discord Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect with fellow developers, share knowledge, and participate in community events.
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Real-time chat</Badge>
                  <Badge variant="secondary">Tech discussions</Badge>
                  <Badge variant="secondary">Community events</Badge>
                  <Badge variant="secondary">Resource sharing</Badge>
                </div>
                <Button 
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                  onClick={() => window.open(discordUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Discord Server
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mentorship Program Card */}
          <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Find a Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get personalized guidance from experienced developers in your field of interest.
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">1-on-1 sessions</Badge>
                  <Badge variant="secondary">Career guidance</Badge>
                  <Badge variant="secondary">Code reviews</Badge>
                  <Badge variant="secondary">Project feedback</Badge>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/mentorship/find')}
                >
                  Browse Mentors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get help from the community, share your knowledge, and grow together.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Expert Mentorship</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn from experienced developers who can guide you in your career.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Resource Sharing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access a wealth of learning resources shared by the community.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Mentorship;