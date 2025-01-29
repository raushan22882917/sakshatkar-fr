export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  total_participants: number;
  user_rank?: number;
  participant_count?: number;
  problems: ContestProblem[];
}

export interface ContestProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  solved_count: number;
  attempted_count: number;
  user_status: 'Solved' | 'Attempted' | 'Not Attempted';
}

export interface Problem {
  id: string;
  contest_id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  constraints: string;
  input_format: string;
  output_format: string;
  time_limit: number;
  memory_limit: number;
  testCases: TestCase[];
  solved_count: number;
  attempted_count: number;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  expectedOutput: string;
  passed?: boolean;
  actualOutput?: string;
}

export interface ContestParticipant {
  id: string;
  contest_id: string;
  user_id: string;
  name: string;
  score: number;
  solved_problems: number;
  rank: number;
  joined_at: string;
}