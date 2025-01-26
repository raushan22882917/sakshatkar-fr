export type QuestionType = 'mcq' | 'debugging' | 'coding' | 'theoretical';

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  explanation?: string;
}

export interface PracticeQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  code?: string;
  correctAnswer: string;
  testCases?: TestCase[];
  hints?: string[];
}

export interface EvaluationResponse {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  passed: boolean;
  message: string;
}

export type MessageType = 
  | 'user' 
  | 'error' 
  | 'feedback' 
  | 'understanding-check' 
  | 'practice-question' 
  | 'next-step-prompt';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  suggestedQuestions?: string[];
  practiceData?: PracticeQuestion;
  role?: 'user' | 'assistant';
}