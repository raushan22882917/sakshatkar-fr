import axios from 'axios';

const API_ENDPOINT = "https://api.zerogpt.com/api/detect/detectText";
const API_KEY = "e2148fd5-5c79-4013-b0d2-1090efc5a678";

export interface ZeroGPTResponse {
  real_score: number;
  fake_score: number;
  ai_score: number;
  error?: string;
}

export const zeroGptService = {
  async detectAI(text: string): Promise<ZeroGPTResponse> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          real_score: 100,
          fake_score: 0,
          ai_score: 0
        };
      }

      console.log('Calling ZeroGPT API with text length:', text.length);

      const response = await axios.post(
        API_ENDPOINT,
        {
          input_text: text,
          originalParagraph: "string",
          textWords: text.split(/\s+/).length,
          aiWords: 0,
          fakePercentage: 0,
          sentences: [],
          h: [],
          collection_id: 0,
          fileName: "string",
          feedback: "string"
        },
        {
          headers: {
            "accept": "application/json",
            "ApiKey": API_KEY,
            "Content-Type": "application/json"
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('ZeroGPT API Response:', response.data);

      if (!response.data) {
        throw new Error('Invalid response from AI detection service');
      }

      return {
        real_score: response.data.real_score || 0,
        fake_score: response.data.fake_score || 0,
        ai_score: response.data.ai_score || 0
      };
    } catch (error) {
      console.error('AI detection error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },
};
