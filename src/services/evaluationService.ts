import axios from 'axios';
import { Question } from "@/types/interview";
import { codeExecutionService } from './codeExecutionService';

const API_URL = 'http://localhost:8000/api';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface EvaluationRequest {
  question_id: string;
  step: 'example' | 'solution' | 'test_cases' | 'code' | 'validation';
  content: string;
}

export interface EvaluationResponse {
  id: number;
  feedback: string;
  score: number;
}

export interface CodeRunRequest {
  code: string;
  language: string;
  input: string;
}

export interface CodeRunResponse {
  output: string;
  error: string | null;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
}

export interface EvaluationService {
  evaluate(data: EvaluationRequest): Promise<EvaluationResponse>;
  getSubmissions(questionId: string): Promise<any>;
  runCode(code: string, language: string, input: string): Promise<CodeRunResponse>;
  submitCode(code: string, language: string, questionId: string): Promise<EvaluationResponse>;
  evaluateAnswer(question: Question, answer: string, language?: string): Promise<EvaluationResult>;
}

export const evaluationService: EvaluationService = {
  async evaluate(data: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/submissions/evaluate/`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Evaluation error:', error);
      throw error;
    }
  },

  async getSubmissions(questionId: string) {
    try {
      const response = await axios.get(
        `${API_URL}/submissions/?question_id=${questionId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  async runCode(code: string, language: string, input: string): Promise<CodeRunResponse> {
    try {
      const result = await codeExecutionService.executeCode({
        code,
        language,
        input
      });

      return {
        output: result.output || '',
        error: result.error || null
      };
    } catch (error) {
      console.error('Code run error:', error);
      throw error;
    }
  },

  async submitCode(code: string, language: string, questionId: string): Promise<EvaluationResponse> {
    try {
      // First run the code with test cases
      const testCases = [
        { input: "test input 1", expectedOutput: "expected output 1" },
        { input: "test input 2", expectedOutput: "expected output 2" }
      ];

      const results = await Promise.all(
        testCases.map(async (testCase) => {
          const result = await codeExecutionService.executeCode({
            code,
            language,
            input: testCase.input
          });

          if (result.error) {
            return { passed: false, message: result.error };
          }

          const output = result.output.trim();
          const expectedOutput = testCase.expectedOutput.trim();
          return {
            passed: output === expectedOutput,
            message: output === expectedOutput 
              ? "Test case passed!"
              : `Expected: ${expectedOutput}, Got: ${output}`
          };
        })
      );

      const allPassed = results.every(r => r.passed);
      const messages = results.map((r, i) => `Test Case ${i + 1}: ${r.message}`).join('\n');

      return {
        id: parseInt(questionId),
        feedback: messages,
        score: allPassed ? 100 : 0
      };
    } catch (error) {
      console.error('Code submission error:', error);
      throw error;
    }
  },

  async evaluateAnswer(question: Question, answer: string, language?: string): Promise<EvaluationResult> {
    if (!GROQ_API_KEY || GROQ_API_KEY === "your-groq-api-key") {
      // Mock evaluation for development
      return {
        score: Math.floor(Math.random() * 5) + 5,
        feedback: "Good attempt with room for improvement.",
        strengths: ["Clear explanation", "Good approach"],
        improvements: ["Consider edge cases", "Add more examples"],
        detailedAnalysis: "The answer demonstrates understanding but could be more comprehensive."
      };
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.
  
Question Type: ${question.type}
Question: ${question.question}
Expected Answer Points: ${question.expectedAnswer}
Evaluation Criteria: ${question.evaluationCriteria?.join(", ")}
${language ? `Programming Language: ${language}` : ""}

Candidate's Answer:
${answer}

Evaluate the answer and provide:
1. Score (0-10)
2. Brief feedback summary
3. Key strengths (list)
4. Areas for improvement (list)
5. Detailed analysis

Format your response as JSON:
{
  "score": number,
  "feedback": "brief summary",
  "strengths": ["point1", "point2", ...],
  "improvements": ["point1", "point2", ...],
  "detailedAnalysis": "detailed evaluation"
}`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an expert technical interviewer providing detailed evaluations."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const evaluation = JSON.parse(data.choices[0].message.content);

      return {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        detailedAnalysis: evaluation.detailedAnalysis
      };
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw error;
    }
  },
};
