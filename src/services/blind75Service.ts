import { supabase } from "@/integrations/supabase/client";

export interface Blind75Submission {
  question_id: string;
  title: string;
  approach: string;
  code: string;
  time_complexity?: string;
  space_complexity?: string;
  execution_time?: number;
  memory_usage?: number;
  score?: number;
  status?: string;
  feedback?: string;
}

export const blind75Service = {
  async saveSubmission(submission: Blind75Submission) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('blind75_submissions')
      .insert([{
        user_id: user.id,
        ...submission,
        status: 'solved'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSubmissionByQuestionId(questionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('blind75_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};