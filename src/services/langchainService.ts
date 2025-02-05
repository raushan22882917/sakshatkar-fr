export interface LangChainService {
  handleResponse: (messages: any[]) => Promise<any>;
  evaluateAnswer: (question: any, answer: string, correctAnswer: string) => Promise<{
    isCorrect: boolean;
    feedback: string;
  }>;
  generateQuestions: (topic: string) => Promise<any>;
  analyzeCode: (code: string) => Promise<any>;
  explainConcept: (concept: string) => Promise<string>;
  suggestImprovement: (code: string) => Promise<string>;
  checkPlagiarism: (submission: string) => Promise<{
    isPlagiarized: boolean;
    similarityScore: number;
    source?: string;
  }>;
}

const langchainService: LangChainService = {
  handleResponse: async (messages) => {
    try {
      // Simple response generation based on the last message
      const lastMessage = messages[messages.length - 1];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: lastMessage.content }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in handleResponse:', error);
      throw new Error('Failed to generate response');
    }
  },

  evaluateAnswer: async (question, answer, correctAnswer) => {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          userAnswer: answer,
          correctAnswer,
        }),
      });

      const result = await response.json();
      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
      };
    } catch (error) {
      console.error('Error in evaluateAnswer:', error);
      throw new Error('Failed to evaluate answer');
    }
  },

  generateQuestions: async (topic) => {
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error in generateQuestions:', error);
      throw new Error('Failed to generate questions');
    }
  },

  analyzeCode: async (code) => {
    try {
      const response = await fetch('/api/code/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error in analyzeCode:', error);
      throw new Error('Failed to analyze code');
    }
  },

  explainConcept: async (concept) => {
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept }),
      });

      const data = await response.json();
      return data.explanation;
    } catch (error) {
      console.error('Error in explainConcept:', error);
      throw new Error('Failed to explain concept');
    }
  },

  suggestImprovement: async (code) => {
    try {
      const response = await fetch('/api/code/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      return data.suggestion;
    } catch (error) {
      console.error('Error in suggestImprovement:', error);
      throw new Error('Failed to suggest improvements');
    }
  },

  checkPlagiarism: async (submission) => {
    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submission }),
      });

      const result = await response.json();
      return {
        isPlagiarized: result.isPlagiarized,
        similarityScore: result.similarityScore,
        source: result.source,
      };
    } catch (error) {
      console.error('Error in checkPlagiarism:', error);
      throw new Error('Failed to check plagiarism');
    }
  },
};

export { langchainService };