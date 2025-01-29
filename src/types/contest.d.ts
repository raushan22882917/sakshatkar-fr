export interface Contest {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: string;
  participant_count: number;
  coding_problems?: {
    id: string;
    title: string;
    difficulty: string;
    points: number;
    solved_count: number;
    attempted_count: number;
  }[];
}