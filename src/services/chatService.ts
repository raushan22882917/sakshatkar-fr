import { groqApi } from './groqApi';

export interface PracticeQuestion {
  type: 'mcq' | 'subjective' | 'debugging' | 'coding' | 'fill_in_blank';
  question: string;
  options?: string[];
  code?: string;
  blanks?: string[];
  correctAnswer: string;
  sampleAnswer?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
  hints?: string[];
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'understanding-check' | 'practice-question' | 'feedback' | 'error' | 'next-step-prompt';
  content: string;
  suggestedQuestions?: string[];
  practiceData?: PracticeQuestion;
}

class ChatService {
  private static instance: ChatService;
  private currentTopic: string = '';
  private context: string = '';
  private currentQuery: string = '';

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async processUserQuery(query: string): Promise<ChatMessage[]> {
    try {
      this.currentQuery = query;
      const explanation = await groqApi.explainConcept(query, this.context);
      
      this.currentTopic = explanation.topic || '';
      this.context += `\n${query}\n${explanation.response}`;

      return [
        {
          id: Date.now().toString(),
          content: explanation.response,
          type: 'text'
        },
        {
          id: (Date.now() + 1).toString(),
          content: "Did you understand this explanation?",
          type: 'understanding-check'
        }
      ];
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }

  public async handleUnderstanding(understood: boolean, previousExplanation: string): Promise<ChatMessage[]> {
    try {
      if (understood) {
        // Generate a question based on the current query
        const questionData = await groqApi.generateQuestion(this.currentQuery);
        
        return [
          {
            id: Date.now().toString(),
            content: "Great! Let's practice with this question about " + this.currentQuery + ":",
            type: 'text'
          },
          {
            id: (Date.now() + 1).toString(),
            content: questionData.question,
            type: 'practice-question',
            practiceData: questionData
          }
        ];
      } else {
        const simpleExplanation = await groqApi.generateSimplifiedExplanation(
          this.currentQuery, // Use current query instead of original
          previousExplanation
        );

        return [
          {
            id: Date.now().toString(),
            content: simpleExplanation.response,
            type: 'text'
          },
          {
            id: (Date.now() + 1).toString(),
            content: "How about now? Did this explanation help you understand better?",
            type: 'understanding-check'
          }
        ];
      }
    } catch (error) {
      console.error('Error handling understanding:', error);
      return [
        {
          id: Date.now().toString(),
          content: "I apologize, but I encountered an error. Would you like me to try explaining " + this.currentQuery + " again?",
          type: 'understanding-check'
        }
      ];
    }
  }

  private async generateRandomPracticeQuestion(query: string): Promise<ChatMessage[]> {
    const question = await this.generatePracticeQuestion(query);
    let content = '';

    switch (question.type) {
      case 'mcq':
        content = `${question.question}\n\n${question.options?.join('\n')}`;
        break;
      case 'subjective':
        content = question.question;
        break;
      case 'debugging':
        content = `${question.question}\n\nDebug this code:\n\`\`\`\n${question.code}\n\`\`\``;
        break;
      case 'coding':
        content = `${question.question}\n\n${question.testCases?.map((tc, i) => 
          `Test Case ${i + 1}:\nInput: ${tc.input}\nExpected Output: ${tc.expectedOutput}`
        ).join('\n\n')}`;
        break;
      case 'fill_in_blank':
        content = `${question.question}\n\nFill in the blanks with: ${question.blanks?.join(', ')}`;
        break;
    }

    return [
      {
        id: Date.now().toString(),
        content,
        type: 'practice-question',
        practiceData: question
      },
      {
        id: (Date.now() + 1).toString(),
        content: "Would you like to try another question or move to a different topic?",
        type: 'next-step-prompt'
      }
    ];
  }

  public async generatePracticeQuestion(query: string): Promise<PracticeQuestion> {
    try {
      const question = await groqApi.generatePracticeQuestion(query);
      return question;
    } catch (error) {
      console.error('Error generating practice question:', error);
      throw error;
    }
  }
}

export const chatService = ChatService.getInstance();
