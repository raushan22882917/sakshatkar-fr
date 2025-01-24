import React from 'react';
import { 
  Brain, 
  Code2, 
  Users as UsersIcon, 
  MessageSquare, 
  BookOpen, 
  Target, 
  Zap,
  Minus,
  Plus 
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the AI Tutor</h1>
      <div className="icon-container">
        <Brain />
        <Code2 />
        <UsersIcon />
        <MessageSquare />
        <BookOpen />
        <Target />
        <Zap />
        <Minus />
        <Plus />
      </div>
    </div>
  );
};

export default Index;
