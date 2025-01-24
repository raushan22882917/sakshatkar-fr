import { Question } from "@/types/interview";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateQuestions(companyName: string, position: string): Promise<Question[]> {
  const systemPrompt = `You are an expert technical interviewer who specializes in creating DSA (Data Structures and Algorithms) and behavioral questions for tech companies.
  Create challenging but fair questions that assess both technical skills and cultural fit.`;

  const userPrompt = `Create an interview question set for a ${position} position at ${companyName}.
  
  Generate exactly:
  - 2 DSA questions that evaluate algorithmic thinking and problem-solving, focusing on common data structures and algorithms used in ${position} roles
  - 2 coding questions that test implementation of these DSA concepts
  - 1 behavioral question specific to ${companyName}'s values and culture, focusing on situations a ${position} might encounter
  
  For DSA questions:
  - Include clear problem constraints
  - Specify expected time/space complexity
  - Include example test cases
  
  For coding questions:
  - Make them implementations of DSA concepts
  - Include input/output format
  - Specify edge cases to handle
  
  For behavioral question:
  - Make it specific to ${companyName}'s culture and values
  - Focus on relevant scenarios for a ${position}
  - Include what you're looking for in the answer
  
  Return ONLY a JSON array with this exact structure for each question:
  {
    "type": "code" | "dsa" | "hr",
    "question": "detailed question text with examples and constraints",
    "timeLimit": number in seconds,
    "expectedAnswer": "detailed solution approach or key points",
    "evaluationCriteria": ["specific points to evaluate"]
  }`;

  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ API key is not configured. Please check your environment variables.');
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to generate questions: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    const questions = JSON.parse(data.choices[0].message.content);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from API');
    }

    return questions.map((q: any) => ({
      type: q.type,
      question: q.question,
      timeLimit: q.timeLimit || (q.type === 'code' ? 1200 : q.type === 'dsa' ? 900 : 300),
      expectedAnswer: q.expectedAnswer || '',
      evaluationCriteria: q.evaluationCriteria || [],
      score: undefined,
      feedback: undefined
    }));
  } catch (error) {
    console.error('Error generating interview questions:', error);
    
    // If API call fails, return mock questions as fallback
    return [
      {
        type: "dsa",
        question: `Design an efficient algorithm to solve the following problem for ${position} role:\nGiven an array of integers representing stock prices, find the maximum profit you can make by buying and selling stocks. You can only hold one stock at a time.\n\nExample:\nInput: [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy at price 1 and sell at price 6.\n\nConstraints:\n- 1 ≤ prices.length ≤ 10^5\n- 0 ≤ prices[i] ≤ 10^4\n\nExpected Time Complexity: O(n)\nExpected Space Complexity: O(1)`,
        timeLimit: 900,
        expectedAnswer: "Use a single pass approach keeping track of minimum price and maximum profit",
        evaluationCriteria: ["Time complexity analysis", "Space complexity analysis", "Edge case handling", "Code optimization"]
      },
      {
        type: "dsa",
        question: `Design a system for ${position} that implements an LRU (Least Recently Used) cache with the following requirements:\n\n1. Fixed size cache\n2. O(1) time complexity for both get and put operations\n3. Remove least recently used item when cache is full\n\nExample:\nLRUCache cache = new LRUCache(2);\ncache.put(1, 1);\ncache.put(2, 2);\ncache.get(1);       // returns 1\ncache.put(3, 3);    // evicts key 2\n\nProvide the data structure design and implementation approach.`,
        timeLimit: 900,
        expectedAnswer: "Use HashMap + Doubly Linked List for O(1) operations",
        evaluationCriteria: ["Data structure choice", "Algorithm efficiency", "Implementation details", "Error handling"]
      },
      {
        type: "code",
        question: "Implement a solution for the first DSA problem (Stock Price Maximum Profit). Include proper error handling and comments.",
        timeLimit: 1200,
        expectedAnswer: "Implementation should use O(n) time complexity and handle edge cases",
        evaluationCriteria: ["Code correctness", "Time complexity", "Error handling", "Code style"]
      },
      {
        type: "code",
        question: "Implement the LRU Cache system from the second DSA problem. Ensure thread safety and proper error handling.",
        timeLimit: 1200,
        expectedAnswer: "Implementation should use HashMap and Doubly Linked List with proper synchronization",
        evaluationCriteria: ["Implementation correctness", "Thread safety", "Error handling", "Code organization"]
      },
      {
        type: "hr",
        question: `At ${companyName}, we value innovative problem-solving and collaboration. Describe a situation where you had to implement a complex technical solution while working with multiple teams. How did you handle technical disagreements, and what was the outcome? Consider this in the context of a ${position} role.`,
        timeLimit: 300,
        expectedAnswer: "Looking for examples of technical leadership, conflict resolution, and project success",
        evaluationCriteria: ["Problem-solving approach", "Team collaboration", "Communication skills", "Technical leadership"]
      }
    ];
  }
}
