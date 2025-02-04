import { TestCase } from '@/types/global';

export interface TestService {
  runTests: (code: string, testCases: TestCase[]) => Promise<any>;
  generateQuestions: (moduleId: string, moduleName: string) => Promise<any>;
}

// Implement the service
const testService: TestService = {
  runTests: async (code: string, testCases: TestCase[]) => {
    // Implementation
  },
  generateQuestions: async (moduleId: string, moduleName: string) => {
    // Implementation
  }
};

export { testService };