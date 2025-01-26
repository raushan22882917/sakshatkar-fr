import axios from 'axios';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class LangChainService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private history: Message[];
  private systemPrompt: string;
  private readonly maxHistoryLength = 10; // Keep last 10 messages for context
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
    },
    {
      type: 'mcq' as const,
      question: 'Which hook should you use to perform side effects in a React component?',
      options: [
        'A) useState',
        'B) useEffect',
        'C) useContext',
        'D) useReducer'
      ],
      correctAnswer: 'B) useEffect'
    }
  ];

  private readonly fallbackResponses = [
    {
      topic: 'react',
      content: "Let me explain React's core concepts. React is a JavaScript library for building user interfaces. It uses a component-based architecture where you build encapsulated components that manage their own state. Key concepts include:\n\n1. Components: Reusable UI pieces\n2. Props: Data passed to components\n3. State: Internal component data\n4. Hooks: Functions that let you use state and lifecycle features",
      suggestedQuestions: [
        "How do I use the useState hook?",
        "What's the difference between props and state?",
        "When should I use useEffect?"
      ]
    },
    {
      topic: 'javascript',
      content: "JavaScript is a versatile programming language that powers web interactivity. Here are the key concepts:\n\n1. Variables & Data Types\n2. Functions & Scope\n3. Asynchronous Programming\n4. DOM Manipulation\n\nWhat specific aspect would you like to learn more about?",
      suggestedQuestions: [
        "How do async/await functions work?",
        "What are closures in JavaScript?",
        "How does event handling work?"
      ]
    },
    {
      topic: 'programming',
      content: "Programming is about solving problems using code. Let's start with these fundamental concepts:\n\n1. Variables and Data Structures\n2. Control Flow (if/else, loops)\n3. Functions and Modularity\n4. Error Handling\n\nWhich area interests you most?",
      suggestedQuestions: [
        "How do I structure my code?",
        "What are best practices for error handling?",
        "How do I debug my code effectively?"
      ]
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

    // Add system prompt to history
    this.history.push({
      role: 'system',
      content: this.systemPrompt
    });
  }

  private addToHistory(role: 'user' | 'assistant', content: string) {
    this.history.push({ role, content });
    
    // Keep only the system prompt and last maxHistoryLength messages
    if (this.history.length > this.maxHistoryLength + 1) {
      this.history = [
        this.history[0], // Keep system prompt
        ...this.history.slice(-(this.maxHistoryLength)) // Keep last maxHistoryLength messages
      ];
    }
  }

  private async getCompletion(input: string): Promise<string> {
    try {
      // Add user message to history
      this.addToHistory('user', input);

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.model,
          messages: this.history,
          temperature: this.temperature,
          max_tokens: this.maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      // Add assistant response to history
      this.addToHistory('assistant', assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Error in Groq API call:', error);
      throw new Error('Failed to get response from AI model');
    }
  }

  public async getResponse(input: string): Promise<string> {
    try {
      const prompt = `Based on this question or topic: "${input}"

      1. Provide a clear explanation
      2. Use examples where helpful
      3. Break down complex concepts
      4. Generate 2 relevant follow-up questions that would help explore this topic further
      
      Format your response like this:
      
      [Explanation]
      Your detailed explanation here...
      
      [Suggested Questions]
      1. First follow-up question
      2. Second follow-up question
      3. Third follow-up question`;

      return await this.getCompletion(prompt);
    } catch (error) {
      console.error('Error in getResponse:', error);
      throw new Error('Failed to process your request. Please try again.');
    }
  }

  public async handleResponse(input: string, selectedModule?: string, sessionHistory?: any[]): Promise<{
    content: string;
    suggestedQuestions: string[];
  }> {
    try {
      const contextPrompt = `Given our conversation history about ${selectedModule || 'this topic'}, answer the following question. 
      If it relates to previous topics we discussed, reference those in your explanation: "${input}"`;
      
      const response = await this.getResponse(contextPrompt);
      
      const [explanation = '', questions = ''] = response.split('[Suggested Questions]');
      
      const suggestedQuestions = questions
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return {
        content: explanation.replace('[Explanation]', '').trim(),
        suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : []
      };
    } catch (error) {
      console.error('Error in handleResponse:', error);
      const fallbackResponse = this.getFallbackResponseForTopic(input) || this.getRandomFallbackResponse();
      return {
        content: fallbackResponse.content,
        suggestedQuestions: fallbackResponse.suggestedQuestions
      };
    }
  }

  public async generateSimplifiedExplanation(query: string, previousExplanation: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are an AI tutor. Your task is to provide a simpler explanation of the same topic that was previously explained.
        The user didn't understand the previous explanation, so:
        1. Use simpler language and everyday analogies
        2. Break down complex concepts into smaller, easier steps
        3. Use more examples and practical applications
        4. Avoid technical jargon unless absolutely necessary
        5. Include visual descriptions or metaphors when possible
        
        Format your response with:
        - Short, clear sentences
        - Bullet points for main ideas
        - Examples after each concept
        - Step-by-step explanations
        
        Previous explanation: "${previousExplanation}"
        Original query: "${query}"
        
        Provide a simpler explanation of the same topic.`
      },
      {
        role: 'user',
        content: `Please explain this in a simpler way: ${query}`
      }
    ];

    return this.getCompletion(messages.map(message => message.content).join('\n'));
  }

  public async generateQuestion(query: string): Promise<{
    question: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    code?: string;
    testCases?: { input: string; expectedOutput: string }[];
    blanks?: string[];
    hints?: string[];
  }> {
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
      "type": "mcq|subjective|debugging|coding|fill-in-blank",
      "options": ["option1", "option2", "option3", "option4"], // for MCQ only
      "correctAnswer": "The correct answer",
      "code": "Any code context if needed",
      "testCases": [{"input": "test input", "expectedOutput": "expected output"}], // for coding questions
      "blanks": ["word1", "word2"], // for fill-in-blank
      "hints": ["Hint specifically about ${query}"]
    }`;

    try {
      const response = await this.getCompletion(prompt);
      const questionData = JSON.parse(response);

      // Validate the response has required fields and is relevant
      if (!questionData.question || !questionData.type || !questionData.correctAnswer) {
        throw new Error("Invalid question format");
      }

      // Ensure the question contains the query topic
      if (!questionData.question.toLowerCase().includes(query.toLowerCase())) {
        questionData.question = `Regarding ${query}: ${questionData.question}`;
      }

      return questionData;
    } catch (error) {
      console.error('Error generating question:', error);
      // Create a focused subjective question about the exact query
      return {
        question: `Explain in detail: ${query}. Make sure to cover the main concepts and provide specific examples.`,
        type: 'subjective',
        correctAnswer: '', // Will be evaluated contextually
        hints: [
          `Focus specifically on ${query}`,
          'Use concrete examples in your explanation'
        ]
      };
    }
  }

  private getRandomFallbackResponse() {
    const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
    return this.fallbackResponses[randomIndex];
  }

  private getFallbackResponseForTopic(topic: string): typeof this.fallbackResponses[0] | null {
    const normalizedTopic = topic.toLowerCase();
    for (const response of this.fallbackResponses) {
      if (normalizedTopic.includes(response.topic)) {
        return response;
      }
    }
    return null;
  }

  public async evaluateAnswer(
    question: any,
    userAnswer: string,
    correctAnswer: string
  ): Promise<{
    isCorrect: boolean;
    feedback: string;
  }> {
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
        "feedback": "2 lines of feedback separated by \\n"
      }`;

      const response = await this.getCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return {
        isCorrect: false,
        feedback: "Sorry, I couldn't evaluate your answer.\nPlease try answering again."
      };
    }
  }
}

export const langchainService = new LangChainService();
