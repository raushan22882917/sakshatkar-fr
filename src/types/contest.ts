import type { Database } from './database.types';

export type Contest = Database['public']['Tables']['coding_contests']['Row'] & {
  problems?: Problem[];
  user_rank?: number;
};

export type Problem = Database['public']['Tables']['coding_problems']['Row'] & {
  user_status?: 'Solved' | 'Attempted' | null;
};

export type ContestParticipant = Database['public']['Tables']['contest_participants']['Row'] & {
  profiles?: {
    name: string;
  };
};

export type ContestSubmission = Database['public']['Tables']['contest_submissions']['Row'];

export type TestCase = {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  explanation?: string;
};
