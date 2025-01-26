export interface Contest {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED';
  participant_count: number;
  user_rank?: number;
  total_participants: number;
  coding_problems: ContestProblem[];
}

export interface ContestProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  solved_count: number;
  attempted_count: number;
  user_status: 'Solved' | 'Attempted' | null;
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