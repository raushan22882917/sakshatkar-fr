import { groqApi } from './groqApi';
import { ChatMessage, PracticeQuestion, QuestionType } from '../types/chat';

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
          type: 'understanding-check',
          suggestedQuestions: explanation.suggestedQuestions
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
        const questionData = await this.generatePracticeQuestion(this.currentQuery);
        
        return [
          {
            id: Date.now().toString(),
            content: "Great! Let's practice with this question about " + this.currentQuery + ":",
            type: 'understanding-check'
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
          this.currentQuery,
          previousExplanation
        );

        return [
          {
            id: Date.now().toString(),
            content: simpleExplanation.response,
            type: 'understanding-check'
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

  public async generatePracticeQuestion(query: string): Promise<PracticeQuestion> {
    try {
      const questionType: QuestionType = this.determineQuestionType(query);
      const response = await groqApi.generatePracticeQuestion(questionType, query);
      
      return {
        type: questionType,
        question: response.response,
        options: response.practice_questions?.[0]?.options,
        code: response.practice_questions?.[0]?.code,
        correctAnswer: response.practice_questions?.[0]?.correctAnswer || '',
        testCases: response.practice_questions?.[0]?.testCases,
        hints: response.practice_questions?.[0]?.hints
      };
    } catch (error) {
      console.error('Error generating practice question:', error);
      throw error;
    }
  }

  private determineQuestionType(query: string): QuestionType {
    // Simple logic to determine question type based on query content
    if (query.toLowerCase().includes('debug') || query.toLowerCase().includes('fix')) {
      return 'debugging';
    } else if (query.toLowerCase().includes('code') || query.toLowerCase().includes('implement')) {
      return 'coding';
    } else if (query.toLowerCase().includes('explain') || query.toLowerCase().includes('describe')) {
      return 'theoretical';
    }
    return 'mcq'; // default to MCQ
  }
}

export const chatService = ChatService.getInstance();