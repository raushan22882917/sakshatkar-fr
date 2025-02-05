export type ContestStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';
export type UserStatus = 'Solved' | 'Attempted' | 'Not Attempted';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ContestProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  solved_count: number;
  attempted_count: number;
  user_status?: UserStatus;
  output?: string;
  passed?: boolean;
  actualOutput?: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  problems?: ContestProblem[];
  total_participants: number;
  coding_problems?: ContestProblem[];
  status?: ContestStatus;
  user_rank?: number;
  created_at?: string;
  is_public?: boolean;
  participant_count?: number;
}

export interface ContestParticipant {
  id: string;
  contest_id: string;
  user_id: string;
  joined_at: string;
  score: number;
  solved_problems: number;
  rank: number;
  name?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  output?: string;
  passed?: boolean;
  actualOutput?: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  constraints?: string;
  input_format?: string;
  output_format?: string;
  time_limit: number;
  memory_limit: number;
  test_cases: TestCase[];
  solved_count?: number;
  attempted_count?: number;
}

export interface EvaluationResponse {
  passed: boolean;
  message: string;
  score?: number;
  executionTime?: number;
  memoryUsed?: number;
}