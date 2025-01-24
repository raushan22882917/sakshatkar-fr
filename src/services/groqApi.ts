import axios, { AxiosError } from 'axios';

interface GroqResponse {
  response: string;
  topic?: string;
  suggestedQuestions?: string[];
  practice_questions?: Array<{
    question: string;
    type: string;
    options?: string[];
    code?: string;
    correctAnswer: string;
    testCases?: Array<{
      input: string;
      expectedOutput: string;
    }>;
    hints?: string[];
  }>;
}

class GroqAPI {
  private static instance: GroqAPI;
  private readonly apiKey: string;
  private readonly baseURL: string = 'https://api.groq.com/openai/v1/chat/completions';
  private currentTopic: string = '';

  private constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('GROQ API key is not set. Please add VITE_GROQ_API_KEY to your environment variables.');
    }
  }

  public static getInstance(): GroqAPI {
    if (!GroqAPI.instance) {
      GroqAPI.instance = new GroqAPI();
    }
    return GroqAPI.instance;
  }

  private async makeRequest(messages: any[]): Promise<GroqResponse> {
    if (!this.apiKey) {
      return {
        response: "API key is not configured. Please check your environment variables."
      };
    }

    try {
      console.log('Making request to Groq API with messages:', messages);
      
      const response = await axios.post(
        this.baseURL,
        {
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        console.error('Invalid response format from Groq:', response.data);
        throw new Error('Invalid response format from Groq API');
      }

      const result = this.parseResponse(response.data.choices[0].message.content);
      console.log('Successful response from Groq:', result);
      return result;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Groq API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          return {
            response: "Authentication failed. Please check your API key."
          };
        }
        
        if (error.response?.status === 429) {
          return {
            response: "Too many requests. Please try again in a moment."
          };
        }
      } else {
        console.error('Unexpected error:', error);
      }

      return {
        response: "An error occurred while processing your request. Please try again."
      };
    }
  }

  private parseResponse(content: string): GroqResponse {
    return { response: content };
  }

  public async explainConcept(query: string, context: string = ''): Promise<GroqResponse> {
    const messages = [
      {
        role: 'system',
        content: `You are an AI tutor specializing in programming education. 
        When explaining concepts:
        1. Start with a brief overview
        2. Use bullet points for key concepts
        3. Use markdown formatting:
           - **bold** for important terms
           - \`code\` for code snippets
           - > for important notes
        4. Include examples where relevant
        5. Break down complex topics into smaller sections
        6. Use numbered lists for steps or sequences
        
        Always format your response in a clear, readable way with proper spacing and organization.`
      },
      {
        role: 'user',
        content: `${context ? 'Previous context: ' + context + '\n' : ''}Question: ${query}`
      }
    ];

    return this.makeRequest(messages);
  }

  public async generateSimplifiedExplanation(topic: string, previousExplanation: string): Promise<GroqResponse> {
    const messages = [
      {
        role: 'system',
        content: `You are an AI tutor. Provide a simpler explanation using:
        1. Simple, everyday analogies
        2. Clear examples
        3. Step-by-step breakdowns
        4. Visual descriptions where possible
        5. Markdown formatting for clarity
        
        Format your response with:
        - Bullet points for main ideas
        - **Bold** for key terms
        - \`code\` for code examples
        - > for important notes`
      },
      {
        role: 'user',
        content: `The user didn't understand this explanation about ${topic}: 
        "${previousExplanation}"
        Please provide a simpler explanation.`
      }
    ];

    return this.makeRequest(messages);
  }

  public async generatePracticeQuestion(type: string, query: string): Promise<GroqResponse> {
    const messages = [
      {
        role: 'system',
        content: `Create a ${type} practice question to test understanding of this specific query: "${query}". Follow this format:

        # Question
        [Clear question text that directly relates to the query]

        ${type === 'debugging' ? `
        # Code to Debug
        \`\`\`
        [code with bug that relates to the query]
        \`\`\`
        ` : ''}

        ${type === 'mcq' ? `
        # Options
        A) [option 1]
        B) [option 2]
        C) [option 3]
        D) [option 4]
        ` : ''}

        # Correct Answer
        [answer]

        # Explanation
        [detailed explanation]

        ${type === 'coding' ? `
        # Hints
        - [hint 1]
        - [hint 2]
        ` : ''}`
      },
      {
        role: 'user',
        content: `Generate a ${type} question that specifically tests understanding of this query: "${query}". Make sure the question directly relates to what was asked.`
      }
    ];

    const response = await this.makeRequest(messages);
    
    // Parse the markdown-formatted response into structured data
    const content = response.response;
    const sections = content.split('\n# ');
    
    const questionData: any = {
      type,
      question: '',
      options: [],
      correctAnswer: '',
      explanation: '',
      hints: []
    };

    sections.forEach(section => {
      const [title, ...content] = section.split('\n');
      const text = content.join('\n').trim();

      switch (title.trim().toLowerCase()) {
        case 'question':
          questionData.question = text;
          break;
        case 'code to debug':
          questionData.code = text.replace(/```/g, '').trim();
          break;
        case 'options':
          questionData.options = text.split('\n')
            .filter(line => line.match(/^[A-D]\) /))
            .map(line => line.replace(/^[A-D]\) /, '').trim());
          break;
        case 'correct answer':
          questionData.correctAnswer = text;
          break;
        case 'explanation':
          questionData.explanation = text;
          break;
        case 'hints':
          questionData.hints = text.split('\n')
            .filter(line => line.startsWith('- '))
            .map(line => line.replace('- ', '').trim());
          break;
      }
    });

    return {
      response: questionData.question,
      practice_questions: [questionData]
    };
  }

  public async evaluateAnswer(
    question: string,
    userAnswer: string,
    correctAnswer: string
  ): Promise<GroqResponse> {
    const messages = [
      {
        role: 'system',
        content: `Evaluate the answer and provide feedback using this format:

        # Result
        [Correct/Incorrect]

        # Feedback
        [Specific feedback about the answer]

        # Explanation
        [Detailed explanation of the correct answer]

        # Tips for Improvement
        - [tip 1]
        - [tip 2]`
      },
      {
        role: 'user',
        content: `
        Question: ${question}
        User's Answer: ${userAnswer}
        Correct Answer: ${correctAnswer}
        Provide feedback on the answer.`
      }
    ];

    return this.makeRequest(messages);
  }
}

export const groqApi = GroqAPI.getInstance();
