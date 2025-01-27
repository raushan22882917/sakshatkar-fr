export interface Question {
  type: 'mcq' | 'debugging' | 'theoretical' | 'coding';
  question: string;
  options?: string[];
  code?: string;
  correctAnswer: string;
  testCases?: TestCase[];
  blanks?: string[];
  hints?: string[];
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  output?: string;
  actualOutput?: string;
  passed?: boolean;
}