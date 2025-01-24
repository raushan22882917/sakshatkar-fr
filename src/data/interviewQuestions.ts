export const interviewQuestions = {
  "Data Structures and Algorithms": {
    "Arrays": [
      {
        id: 1,
        question: "Explain the concept of array manipulation and discuss time complexity for common operations.",
        expectedPoints: [
          "Definition of arrays and basic operations",
          "Time complexity for access O(1)",
          "Time complexity for insertion/deletion O(n)",
          "Memory layout and contiguous storage",
          "Real-world applications"
        ],
        difficulty: "medium",
        maxScore: 10
      },
      {
        id: 2,
        question: "What are the advantages and disadvantages of using arrays compared to linked lists?",
        expectedPoints: [
          "Random access capability",
          "Memory efficiency",
          "Insertion/deletion complexity",
          "Cache performance",
          "Use case scenarios"
        ],
        difficulty: "medium",
        maxScore: 10
      }
    ]
  }
} as const;

export interface Question {
  id: number;
  question: string;
  expectedPoints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  maxScore: number;
}

export const evaluationPrompt = (question: Question, answer: string) => `
You are an expert technical interviewer. Evaluate the following answer for the question:
Question: ${question.question}

Expected discussion points:
${question.expectedPoints.map(point => `- ${point}`).join('\n')}

Candidate's Answer:
${answer}

Evaluate the answer on the following criteria:
1. Technical accuracy
2. Completeness of response
3. Clarity of explanation
4. Practical understanding
5. Use of examples

Assign a score out of ${question.maxScore} points and provide feedback.
Format your response exactly as follows:
{
  "score": <number>,
  "feedback": {
    "strengths": ["point1", "point2"],
    "improvements": ["point1", "point2"]
  },
  "detailedFeedback": "A paragraph of constructive feedback"
}
`;
