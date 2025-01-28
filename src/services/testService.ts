import { supabaseClient } from '@/lib/supabaseClient';
import { TestCase } from '@/types/contest';

export const testService = {
  async runTests(code: string, testCases: TestCase[]) {
    try {
      const { data, error } = await supabaseClient.functions.invoke('run-tests', {
        body: { code, testCases }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error running tests:', error);
      throw error;
    }
  }
};