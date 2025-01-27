export interface AptitudeTest {
  id: string;
  company: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  categories: {
    quantitative: number;
    logical: number;
    verbal: number;
    coding: number;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completionRate?: number;
  lastAttempted?: string;
}

export interface TestCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
}

export interface TestProgress {
  accuracy: number;
  completedTests: number;
  totalTime: number;
  strengths: string[];
  weaknesses: string[];
}