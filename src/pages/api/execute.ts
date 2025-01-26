import { Request, Response } from 'express';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: Request, res: Response) {
  const { userId, questionId, approach, testCases, code, timeComplexity, spaceComplexity } = req.body;

  if (!userId || !questionId || !approach || !testCases || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Logic to evaluate the submission
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          user_id: userId,
          question_id: questionId,
          approach,
          test_cases: testCases,
          code,
          time_complexity: timeComplexity,
          space_complexity: spaceComplexity,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ message: 'Submission evaluated successfully', data });
  } catch (error) {
    console.error('Error evaluating submission:', error);
    return res.status(500).json({ error: 'Failed to evaluate submission' });
  }
}
