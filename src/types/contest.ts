export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  problems: ContestProblem[];
  coding_problems: ContestProblem[];
  total_participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  participant_count?: number;
  user_rank?: number;
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
}