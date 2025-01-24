export interface Interview {
  id: string;
  title: string;
  date: string;
  status: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  total_score?: number;
  created_at: string;
}

export interface Question {
  type: 'code' | 'dsa' | 'hr';
  question: string;
  timeLimit: number;
  expectedAnswer?: string;
  evaluationCriteria?: string[];
  score?: number;
  feedback?: string;
}