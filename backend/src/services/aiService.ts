import axios, { AxiosInstance } from 'axios';
import env from '../config/env';

class AIServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.aiServiceUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': env.aiServiceApiKey,
      },
      timeout: 60000, // 60 seconds for AI generation
    });
  }

  /**
   * Generate campaign copy with SSE streaming
   * @param data - Generation request data
   * @param onProgress - Progress callback
   */
  async generateCopy(
    data: {
      campaign_name?: string;
      objectives: string;
      target_audience: string;
      tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
      industry?: string;
      products?: string[];
    },
    onProgress: (step: string, content: string, progress: number) => void
  ): Promise<any> {
    try {
      const response = await this.client.post('/generate/copy', data, {
        responseType: 'text',
      });

      // Parse SSE stream
      const lines = response.data.split('\n');
      let result: any = {};

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const parsedData = JSON.parse(line.substring(6));

          // Handle progress events (from AI service)
          if (parsedData.step && parsedData.progress) {
            onProgress(parsedData.step, parsedData.content || '', parsedData.progress);
          }
          
          // Handle complete event - contains the actual AI result
          // The complete event has headlines, body_copy, etc.
          if (parsedData.headlines || parsedData.body_copy) {
            result = parsedData;
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error('AI copy generation error:', error);
      throw new Error(error.response?.data?.error?.message || 'AI service error');
    }
  }

  /**
   * Generate social media posts
   * @param data - Generation request data
   */
  async generateSocial(data: {
    campaign_info: any;
    platforms: ('facebook' | 'twitter' | 'linkedin' | 'instagram')[];
    post_count?: number;
    include_hashtags?: boolean;
  }): Promise<any> {
    try {
      const response = await this.client.post('/generate/social', data);
      return response.data;
    } catch (error: any) {
      console.error('AI social post generation error:', error);
      throw new Error(error.response?.data?.error?.message || 'AI service error');
    }
  }

  /**
   * Generate hashtags
   * @param data - Generation request data
   */
  async generateHashtags(data: {
    campaign_topic: string;
    industry?: string;
    brand_name?: string;
    count?: number;
    language?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/generate/hashtags', data);
      return response.data;
    } catch (error: any) {
      console.error('AI hashtag generation error:', error);
      throw new Error(error.response?.data?.error?.message || 'AI service error');
    }
  }

  /**
   * Check AI service health
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    ai_provider: 'connected' | 'disconnected';
    model_status: 'available' | 'rate_limited' | 'error';
  }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('AI service health check failed:', error);
      throw new Error('AI service unavailable');
    }
  }
}

// Export singleton instance
export const aiService = new AIServiceClient();
export default aiService;
