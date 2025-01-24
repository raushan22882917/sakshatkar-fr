import axios from 'axios';

export interface CodeExecutionRequest {
  code: string;
  language: string;
  input?: string;
}

export interface CodeExecutionResponse {
  output: string;
  error?: string;
  statusCode: number;
  memory?: string;
  cpuTime?: string;
}

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

export const codeExecutionService = {
  async executeCode(data: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      // Get API credentials from environment variables
      const clientId = import.meta.env.VITE_JDOODLE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_JDOODLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('JDoodle API credentials not configured');
      }

      // Map language to JDoodle language identifier
      const languageMap: { [key: string]: string } = {
        'javascript': 'nodejs',
        'python': 'python3',
        'java': 'java',
        'cpp': 'cpp17',
        'typescript': 'typescript',
      };

      const jdoodleLanguage = languageMap[data.language.toLowerCase()] || data.language;

      const response = await axios.post(JDOODLE_API_URL, {
        script: data.code,
        language: jdoodleLanguage,
        versionIndex: '0',
        clientId,
        clientSecret,
        stdin: data.input
      });

      return {
        output: response.data.output,
        statusCode: response.status,
        memory: response.data.memory,
        cpuTime: response.data.cpuTime
      };
    } catch (error: any) {
      console.error('Code execution error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          output: '',
          error: error.response.data.error || 'Server error occurred',
          statusCode: error.response.status
        };
      } else if (error.request) {
        // The request was made but no response was received
        return {
          output: '',
          error: 'No response from code execution server',
          statusCode: 500
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          output: '',
          error: error.message || 'Failed to execute code',
          statusCode: 500
        };
      }
    }
  }
};
