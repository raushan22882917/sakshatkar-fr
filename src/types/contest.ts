export type ContestStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';
export type UserStatus = 'Solved' | 'Attempted';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ContestProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  solved_count: number;
  attempted_count: number;
  user_status: UserStatus;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  problems: ContestProblem[];
  total_participants: number;
  coding_problems?: ContestProblem[];
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
  explanation?: string;
}