import { supabase } from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'mcq' | 'fillInBlanks' | 'code' | 'debugging' | 'puzzle' | 'multipleCorrect';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  code?: string;
  explanation?: string;
}

export const testService = {
  async generateQuestions(moduleId: string, moduleName: string): Promise<Question[]> {
    try {
      // In a real application, you would make an API call to your GROQ endpoint
      // For now, we'll return mock questions
      const mockQuestions: Question[] = [
        {
          id: '1',
          type: 'mcq',
          question: 'What is the primary purpose of variables in programming?',
          options: [
            'To store and manage data',
            'To create user interfaces',
            'To connect to databases',
            'To handle network requests'
          ],
          correctAnswer: 'To store and manage data',
          explanation: 'Variables are used to store and manage data in a program, making it possible to work with different types of information throughout the code.'
        },
        {
          id: '2',
          type: 'fillInBlanks',
          question: 'In Python, to declare a variable named "count" with value 10, you write: _____ = 10',
          correctAnswer: 'count',
          explanation: 'In Python, variables are created by simply assigning a value using the = operator.'
        },
        {
          id: '3',
          type: 'code',
          question: 'Write a function that returns the sum of two numbers.',
          correctAnswer: 'def add_numbers(a, b):\n    return a + b',
          explanation: 'This is a basic function that takes two parameters and returns their sum using the + operator.'
        },
        {
          id: '4',
          type: 'debugging',
          question: 'Find and fix the error in this code:',
          code: 'def calculate_average(numbers):\n    total = 0\n    for num in numbers\n        total += num\n    return total / len(numbers)',
          correctAnswer: 'def calculate_average(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total / len(numbers)',
          explanation: 'The error was a missing colon (:) after the for loop declaration.'
        },
        {
          id: '5',
          type: 'multipleCorrect',
          question: 'Which of the following are valid variable names in Python? (Select all that apply)',
          options: [
            'my_variable',
            '123variable',
            '_hidden',
            'class',
            'camelCase'
          ],
          correctAnswer: ['my_variable', '_hidden', 'camelCase'],
          explanation: 'Valid variable names must start with a letter or underscore, can contain letters, numbers, and underscores, and cannot be Python keywords.'
        }
      ];

      return mockQuestions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }
};
