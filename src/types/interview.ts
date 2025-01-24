export interface Question {
  type: 'code' | 'dsa' | 'hr';
  question: string;
  timeLimit: number;
  expectedAnswer?: string;
  evaluationCriteria?: string[];
  score?: number;
  feedback?: string;
}
