import axios from 'axios';

const SAPLING_API_KEY = 'UKBBD94K3GPLDCII4851RINM5LZT6UYD';
const SAPLING_API_URL = 'https://api.sapling.ai/api/v1/aidetect';

export interface SaplingAIDetectResponse {
  scores: number[];
  error?: string;
}

export const saplingService = {
  async detectAI(text: string): Promise<SaplingAIDetectResponse> {
    try {
      if (!text || text.trim().length === 0) {
        return { scores: [0] };
      }

      console.log('Calling Sapling AI API with text length:', text.length);
      
      const response = await axios.post(
        SAPLING_API_URL,
        {
          key: SAPLING_API_KEY,
          text: [text],
          options: {
            "html_strip": true
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Sapling API Response:', response.data);

      if (!response.data || !Array.isArray(response.data.scores)) {
        console.error('Invalid response from Sapling API:', response.data);
        throw new Error('Invalid response format from AI detection service');
      }

      return response.data;
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
