import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIDialog } from '@/components/interview/AIDialog';
import { Brain } from 'lucide-react';

interface InterviewQuestion {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    category: "Data Structures",
    question: "Can you explain what a Binary Search Tree is and its main operations?",
    answer: "A Binary Search Tree (BST) is a binary tree data structure where each node has at most two children, and for each node: all nodes in the left subtree have values less than the node's value, and all nodes in the right subtree have values greater than the node's value. Main operations include:\n\n1. Insertion (O(log n) average case)\n2. Deletion (O(log n) average case)\n3. Search (O(log n) average case)\n4. Traversal (inorder, preorder, postorder)\n\nBSTs are efficient for searching, inserting, and deleting elements when balanced.",
  },
  {
    id: 2,
    category: "Algorithms",
    question: "What is the difference between BFS and DFS traversal?",
    answer: "BFS (Breadth-First Search) and DFS (Depth-First Search) are two different approaches to traverse graphs or trees:\n\nBFS:\n- Explores all nodes at the current depth before moving to nodes at the next depth level\n- Uses a queue data structure\n- Good for finding shortest path\n- Uses more memory for storing nodes\n\nDFS:\n- Explores as far as possible along each branch before backtracking\n- Uses a stack or recursion\n- Uses less memory compared to BFS\n- Better for maze solving or path finding",
  },
  {
    id: 3,
    category: "System Design",
    question: "How would you design a URL shortening service like bit.ly?",
    answer: "A URL shortening service requires several key components:\n\n1. API Gateway:\n- Handle incoming requests\n- Load balancing\n- Authentication\n\n2. Application Server:\n- URL validation\n- Short URL generation\n- CRUD operations\n\n3. Database:\n- Store URL mappings\n- Consider using both SQL and NoSQL\n\n4. Cache Layer:\n- Redis/Memcached for frequent URLs\n- Improve response time\n\n5. Analytics:\n- Track clicks and usage\n- Generate reports\n\nKey considerations:\n- Unique ID generation\n- Scalability\n- Security\n- Analytics",
  },
];

export function InterviewPractice() {
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const groupedQuestions = interviewQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, InterviewQuestion[]>);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Interview Practice</h1>

        {Object.entries(groupedQuestions).map(([category, questions]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle>{question.question}</CardTitle>
                    <CardDescription>Click the AI button to practice answering this question</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setSelectedQuestion(question);
                          setIsDialogOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        Practice with AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedQuestion && (
        <AIDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          question={selectedQuestion.question}
          correctAnswer={selectedQuestion.answer}
        />
      )}
    </div>
  );
}
