export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          college: string | null;
          created_at: string;
          updated_at: string;
          profile_image_url: string | null;
          bio: string | null;
          badges: any[] | null;
          resume_url: string | null;
          level: string | null;
          open_to_work: boolean | null;
          user_type: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          college?: string | null;
          created_at?: string;
          updated_at?: string;
          profile_image_url?: string | null;
          bio?: string | null;
          badges?: any[] | null;
          resume_url?: string | null;
          level?: string | null;
          open_to_work?: boolean | null;
          user_type?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          college?: string | null;
          created_at?: string;
          updated_at?: string;
          profile_image_url?: string | null;
          bio?: string | null;
          badges?: any[] | null;
          resume_url?: string | null;
          level?: string | null;
          open_to_work?: boolean | null;
          user_type?: string | null;
        };
      };
      coding_contests: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          created_at: string;
          created_by: string | null;
          is_public: boolean;
          status: 'UPCOMING' | 'ONGOING' | 'ENDED';
          participant_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          created_at?: string;
          created_by?: string | null;
          is_public?: boolean;
          status?: 'UPCOMING' | 'ONGOING' | 'ENDED';
          participant_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          created_by?: string | null;
          is_public?: boolean;
          status?: 'UPCOMING' | 'ONGOING' | 'ENDED';
          participant_count?: number;
        };
      };
      coding_problems: {
        Row: {
          id: string;
          contest_id: string;
          title: string;
          description: string;
          difficulty: 'EASY' | 'MEDIUM' | 'HARD';
          points: number;
          constraints: string | null;
          input_format: string | null;
          output_format: string | null;
          time_limit: number;
          memory_limit: number;
          test_cases: any;
          solved_count: number;
          attempted_count: number;
        };
        Insert: {
          id?: string;
          contest_id: string;
          title: string;
          description: string;
          difficulty: 'EASY' | 'MEDIUM' | 'HARD';
          points: number;
          constraints?: string | null;
          input_format?: string | null;
          output_format?: string | null;
          time_limit?: number;
          memory_limit?: number;
          test_cases?: any;
          solved_count?: number;
          attempted_count?: number;
        };
        Update: {
          id?: string;
          contest_id?: string;
          title?: string;
          description?: string;
          difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
          points?: number;
          constraints?: string | null;
          input_format?: string | null;
          output_format?: string | null;
          time_limit?: number;
          memory_limit?: number;
          test_cases?: any;
          solved_count?: number;
          attempted_count?: number;
        };
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
        Insert: {
          id?: string;
          contest_id: string;
          user_id: string;
          joined_at?: string;
          score?: number;
          solved_problems?: number;
          rank?: number;
        };
        Update: {
          id?: string;
          contest_id?: string;
          user_id?: string;
          joined_at?: string;
          score?: number;
          solved_problems?: number;
          rank?: number;
        };
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
          execution_time: number | null;
          memory_used: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          problem_id: string;
          user_id: string;
          code: string;
          language: string;
          status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
          score?: number;
          execution_time?: number | null;
          memory_used?: number | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          contest_id?: string;
          problem_id?: string;
          user_id?: string;
          code?: string;
          language?: string;
          status?: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
          score?: number;
          execution_time?: number | null;
          memory_used?: number | null;
          submitted_at?: string;
        };
      };
      blind75_submissions: {
        Row: {
          id: string;
          user_id: string | null;
          question_id: string;
          title: string;
          approach: string;
          code: string;
          time_complexity: string | null;
          space_complexity: string | null;
          execution_time: number | null;
          memory_usage: number | null;
          score: number | null;
          status: string | null;
          feedback: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          question_id: string;
          title: string;
          approach: string;
          code: string;
          time_complexity?: string | null;
          space_complexity?: string | null;
          execution_time?: number | null;
          memory_usage?: number | null;
          score?: number | null;
          status?: string | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          question_id?: string;
          title?: string;
          approach?: string;
          code?: string;
          time_complexity?: string | null;
          space_complexity?: string | null;
          execution_time?: number | null;
          memory_usage?: number | null;
          score?: number | null;
          status?: string | null;
          feedback?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
