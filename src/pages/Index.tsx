import React from 'react';
import { 
  Brain, 
  Code2, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Target, 
  Zap,
  Minus,
  Plus 
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to CodeHive</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <Brain className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Python Learning</h2>
            <p className="text-muted-foreground">Master Python programming from basics to advanced concepts.</p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <Code2 className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">DSA Basics</h2>
            <p className="text-muted-foreground">Learn fundamental data structures and algorithms.</p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">DSA Intermediate</h2>
            <p className="text-muted-foreground">Advance your DSA knowledge with complex problems.</p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <MessageSquare className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">DSA Advanced</h2>
            <p className="text-muted-foreground">Master advanced algorithms and optimization techniques.</p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Study Resources</h2>
            <p className="text-muted-foreground">Access comprehensive learning materials and guides.</p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <Target className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Practice Arena</h2>
            <p className="text-muted-foreground">Test your skills with real-world coding challenges.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;