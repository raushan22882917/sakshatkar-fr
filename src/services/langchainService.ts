import { PracticeQuestion, EvaluationResponse } from '@/types/chat';

class LangChainService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private history: { role: 'system' | 'user' | 'assistant', content: string }[];
  private systemPrompt: string;
  private readonly maxHistoryLength = 10;
  private readonly fallbackQuestions = [
    {
      type: 'mcq' as const,
      question: 'What is the main purpose of React\'s useState hook?',
      options: [
        'A) To handle side effects in components',
        'B) To manage and update state in functional components',
        'C) To create new React components',
        'D) To handle routing in React applications'
      ],
      correctAnswer: 'B) To manage and update state in functional components'
    },
    {
      type: 'debugging' as const,
      question: 'Find and fix the bug in this React component that causes an infinite re-render:',
      code: `function Counter() {
  const [count, setCount] = useState(0);
  
  setCount(count + 1); // Bug: Direct state update in component body
  
  return (
    <div>
      <p>Count: {count}</p>
      <button>Increment</button>
    </div>
  );
}`,
      correctAnswer: `function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`
    }
  ];

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.model = "mixtral-8x7b-32768";
    this.temperature = 0.7;
    this.maxTokens = 4096;
    this.history = [];
    this.systemPrompt = `You are an AI tutor helping users learn programming concepts. 
    Provide clear, technical explanations with examples. Focus on practical applications and best practices.
    When generating questions, ensure they are objective and have clear, verifiable answers.
    Maintain context from previous messages to provide relevant and connected responses.
    If the user's question relates to previous topics, reference those earlier explanations.`;

    this.history.push({
      role: 'system',
      content: this.systemPrompt
    });
  }

  async evaluateAnswer(
    question: PracticeQuestion,
    userAnswer: string,
    correctAnswer: string
  ): Promise<EvaluationResponse> {
    try {
      const prompt = `Evaluate this answer based on the question type:
      
      Question Type: ${question.type}
      Question: ${question.question}
      User's Answer: ${userAnswer}
      Correct Answer: ${correctAnswer}
      ${question.code ? `Code Context: ${question.code}` : ''}
      ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ''}

      Provide a very concise 2-line feedback:
      Line 1: Whether the answer is correct and a brief reason why
      Line 2: A quick tip for improvement if wrong, or reinforcement if correct

      Format as JSON:
      {
        "isCorrect": boolean,
        "feedback": "2 lines of feedback separated by \\n",
        "explanation": "Detailed explanation of why the answer is correct/incorrect"
      }`;

      const response = await this.makeRequest([{
        role: 'user',
        content: prompt
      }]);

      const result = JSON.parse(response);
      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        explanation: result.explanation
      };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return {
        isCorrect: false,
        feedback: "Sorry, I couldn't evaluate your answer.\nPlease try answering again.",
        explanation: "There was an error processing your answer. Please try again or ask for clarification."
      };
    }
  }

  async generateQuestion(query: string): Promise<PracticeQuestion> {
    const prompt = `Generate a focused practice question about: "${query}"

    Important Rules:
    1. The question MUST be specifically about "${query}" - not a related or general topic
    2. Choose the question type that best tests understanding of "${query}":
       - MCQ: For testing concept recognition
       - Subjective: For explaining relationships
       - Debugging: For fixing issues
       - Coding: For implementing solutions
       - Fill-in-blank: For key terms and definitions
    3. Include relevant context from "${query}" in the question
    4. Make sure hints relate directly to "${query}"
    
    Format response as JSON:
    {
      "question": "Question specifically about ${query}",
      "type": "mcq|subjective|debugging|coding|fill_in_blank",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "The correct answer",
      "code": "Any code context if needed",
      "testCases": [{"input": "test input", "expectedOutput": "expected output"}],
      "blanks": ["word1", "word2"],
      "hints": ["Hint specifically about ${query}"]
    }`;

    try {
      const response = await this.makeRequest([{
        role: 'user',
        content: prompt
      }]);

      const questionData = JSON.parse(response);
      return questionData;
    } catch (error) {
      console.error('Error generating question:', error);
      return {
        type: 'subjective',
        question: `Explain in detail: ${query}. Make sure to cover the main concepts and provide specific examples.`,
        correctAnswer: '',
        hints: [
          `Focus specifically on ${query}`,
          'Use concrete examples in your explanation'
        ]
      };
    }
  }

  private async makeRequest(messages: { role: 'system' | 'user' | 'assistant', content: string }[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key is not configured');
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [...this.history, ...messages],
          temperature: this.temperature,
          max_tokens: this.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Update history
      messages.forEach(msg => this.history.push(msg));
      this.history.push({
        role: 'assistant',
        content
      });

      // Trim history if too long
      if (this.history.length > this.maxHistoryLength + 1) {
        this.history = [
          this.history[0],
          ...this.history.slice(-(this.maxHistoryLength))
        ];
      }

      return content;
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }
}

export const langchainService = new LangChainService();