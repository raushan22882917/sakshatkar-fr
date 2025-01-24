import { supabase } from "@/integrations/supabase/client";
import { Interview } from "@/types/interview";

export const getInterviewList = async (): Promise<Interview[]> => {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateInterviewStatus = async (id: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('interview_sessions')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};