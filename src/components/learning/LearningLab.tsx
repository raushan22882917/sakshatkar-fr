import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

interface Subtopic {
  id: string;
  title: string;
  description: string;
}

const topics: Topic[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    subtopics: [
      {
        id: '1-1',
        title: 'Variables and Data Types',
        description: 'Learn about var, let, const, and different data types in JavaScript'
      },
      {
        id: '1-2',
        title: 'Functions and Scope',
        description: 'Understanding function declarations, expressions, and scope in JavaScript'
      },
      {
        id: '1-3',
        title: 'Arrays and Objects',
        description: 'Working with arrays, objects, and their built-in methods'
      }
    ]
  },
  {
    id: '2',
    title: 'React Essentials',
    subtopics: [
      {
        id: '2-1',
        title: 'Components and Props',
        description: 'Building blocks of React applications'
      },
      {
        id: '2-2',
        title: 'State and Lifecycle',
        description: 'Managing component state and lifecycle methods'
      },
      {
        id: '2-3',
        title: 'Hooks',
        description: 'Using React Hooks for state and side effects'
      }
    ]
  },
  // Add more topics as needed
];

interface LearningLabProps {
  onSubtopicSelect: (topic: string, subtopic: Subtopic) => void;
}

const LearningLab: React.FC<LearningLabProps> = ({ onSubtopicSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.subtopics.some(subtopic => 
      subtopic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subtopic.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search topics and subtopics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {filteredTopics.map(topic => (
            <div key={topic.id} className="space-y-2">
              <Button
                variant={selectedTopic?.id === topic.id ? "secondary" : "ghost"}
                className="w-full justify-start font-semibold"
                onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
              >
                {topic.title}
              </Button>
              
              {selectedTopic?.id === topic.id && (
                <div className="pl-4 space-y-2">
                  {topic.subtopics.map(subtopic => (
                    <div
                      key={subtopic.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => onSubtopicSelect(topic.title, subtopic)}
                    >
                      <h3 className="font-medium">{subtopic.title}</h3>
                      <p className="text-sm text-muted-foreground">{subtopic.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LearningLab;
