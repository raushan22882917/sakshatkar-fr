export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  total_participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  participant_count?: number;
  user_rank?: number;
  problems?: ContestProblem[];
  coding_problems?: ContestProblem[];
}

export interface ContestProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  solved_count: number;
  attempted_count: number;
  user_status: 'Solved' | 'Attempted';
  testCases: TestCase[];
  constraints?: string;
  input_format?: string;
  output_format?: string;
  time_limit?: number;
  memory_limit?: number;
}

export interface ContestParticipant {
  id: string;
  user_id: string;
  contest_id: string;
  name: string;
  score: number;
  solved_problems: number;
  rank: number;
  joined_at: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testCases: TestCase[];
  constraints?: string;
  input_format?: string;
  output_format?: string;
  time_limit?: number;
  memory_limit?: number;
  points?: number;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  explanation?: string;
  is_hidden?: boolean;
  passed?: boolean;
  actualOutput?: string;
}