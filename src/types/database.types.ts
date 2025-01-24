export interface Database {
  public: {
    Tables: {
      coding_contests: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_time: string;
          end_time: string;
          created_at: string;
          created_by: string;
          is_public: boolean;
          status: 'UPCOMING' | 'ONGOING' | 'ENDED';
          participant_count: number;
        };
        Insert: Omit<Tables['coding_contests']['Row'], 'id' | 'created_at' | 'participant_count'>;
        Update: Partial<Tables['coding_contests']['Row']>;
      };
      coding_problems: {
        Row: {
          id: string;
          contest_id: string;
          title: string;
          description: string;
          difficulty: 'EASY' | 'MEDIUM' | 'HARD';
          points: number;
          constraints: string;
          input_format: string;
          output_format: string;
          time_limit: number;
          memory_limit: number;
          test_cases: {
            input: string;
            output: string;
            explanation?: string;
          }[];
          solved_count: number;
          attempted_count: number;
        };
        Insert: Omit<Tables['coding_problems']['Row'], 'id' | 'solved_count' | 'attempted_count'>;
        Update: Partial<Tables['coding_problems']['Row']>;
      };
      contest_participants: {
        Row: {
          id: string;
          contest_id: string;
          user_id: string;
          joined_at: string;
          score: number;
          solved_problems: number;
          rank: number;
        };
        Insert: Omit<Tables['contest_participants']['Row'], 'id' | 'joined_at' | 'score' | 'solved_problems' | 'rank'>;
        Update: Partial<Tables['contest_participants']['Row']>;
      };
      contest_submissions: {
        Row: {
          id: string;
          contest_id: string;
          problem_id: string;
          user_id: string;
          code: string;
          language: string;
          status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
          score: number;
          execution_time: number;
          memory_used: number;
          submitted_at: string;
        };
        Insert: Omit<Tables['contest_submissions']['Row'], 'id' | 'submitted_at'>;
        Update: Partial<Tables['contest_submissions']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
        };
        Insert: Omit<Tables['profiles']['Row'], 'id'>;
        Update: Partial<Tables['profiles']['Row']>;
      };
    };
  };
}
