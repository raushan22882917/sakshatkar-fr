export interface Question {
  type: 'mcq' | 'debugging' | 'theoretical' | 'coding';
  question: string;
  options?: string[];
  code?: string;
  correctAnswer: string;
  testCases?: { input: string; expectedOutput: string; }[];
  blanks?: string[];
  hints?: string[];
  explanation?: string;
}
