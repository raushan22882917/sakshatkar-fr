import { useState } from "react";
import { PracticeModeCard } from "@/components/PracticeModeCard";
import { Code, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import articles from "@/data/articles.json";

interface Article {
  id: number;
  title: string;
  author: string;
  publishDate: string;
  category: string;
  content: string;
  readTime: string;
  likes: number;
  dislikes: number;
  tags: string[];
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState("Reading Material");
  const [searchTerm, setSearchTerm] = useState("");
  const [articleLikes, setArticleLikes] = useState<Record<number, number>>(
    Object.fromEntries(articles.articles.map(a => [a.id, a.likes]))
  );
  const [articleDislikes, setArticleDislikes] = useState<Record<number, number>>(
    Object.fromEntries(articles.articles.map(a => [a.id, a.dislikes]))
  );

  const resources = {
    "Reading Material": [
      {
        title: "AI-Assisted DevOps",
        description: "Learn about DevOps concepts with AI support.",
        icon: Code,
        route: "/devops-flow",
        image: "https://www.amplework.com/wp-content/uploads/2022/07/DevOps-with-AI.png",
      },
      {
        title: "Machine Learning",
        description: "Guide you for interviews to increase hiring chances.",
        icon: Code,
        route: "/ml-practice",
        image: "https://www.amplework.com/wp-content/uploads/2022/07/DevOps-with-AI.png",
      },
    ],
    "Interview Material": [
      {
        title: "Top 50 DevOps Questions",
        description: "Prepare for DevOps interviews with these top questions.",
        icon: Code,
        route: "/interview/devops-questions",
        image: "https://via.placeholder.com/300x200.png?text=DevOps+Interview+Questions",
      },
      {
        title: "Machine Learning Interview Tips",
        description: "Ace your ML interviews with expert tips and tricks.",
        icon: Code,
        route: "/interview-practice",
        image: "https://via.placeholder.com/300x200.png?text=ML+Interview+Tips",
      },
    ],
    
  };

  const filteredResources = resources[activeTab]?.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLike = (articleId: number) => {
    setArticleLikes(prev => ({
      ...prev,
      [articleId]: prev[articleId] + 1
    }));
  };

  const handleDislike = (articleId: number) => {
    setArticleDislikes(prev => ({
      ...prev,
      [articleId]: prev[articleId] + 1
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          {Object.keys(resources).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            key="Articles"
            onClick={() => setActiveTab("Articles")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "Articles"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Articles
          </button>
        </div>

        {activeTab === "Articles" ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">Title</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-center">Likes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.articles.map((article: Article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{articleLikes[article.id]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/article/${article.id}`)}
                      >
                        Read Full
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources?.map((resource, index) => (
              <Link key={index} to={resource.route}>
                <PracticeModeCard {...resource} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}