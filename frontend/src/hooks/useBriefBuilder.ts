import { useState, useCallback } from 'react';
import { api } from '../services/api';

export interface BriefFormData {
  campaign_name: string;
  client_name: string;
  industry: string;
  objectives: string;
  target_audience: string;
  key_messages: string[];
  brand_voice: 'professional' | 'casual' | 'urgent' | 'friendly';
  products: string[];
}

export interface GeneratedBrief {
  id?: string;
  title: string;
  objectives: string;
  target_audience: string;
  ai_generated_copy?: {
    headlines: string[];
    body_copy: string[];
    ctas: string[];
    email_subjects: string[];
    taglines: string[];
    word_count: number;
  };
  social_posts?: any;
  hashtags?: any;
  status: string;
}

interface UseBriefBuilderResult {
  brief: GeneratedBrief | null;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  submitBrief: (data: BriefFormData) => Promise<void>;
  saveBrief: (brief: GeneratedBrief) => Promise<void>;
  clearBrief: () => void;
}

export function useBriefBuilder(): UseBriefBuilderResult {
  const [brief, setBrief] = useState<GeneratedBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const submitBrief = useCallback(async (data: BriefFormData) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const requestData = {
        objectives: data.objectives,
        target_audience: data.target_audience,
        brand_voice: data.brand_voice,
        key_messages: data.key_messages.filter(m => m.trim()),
      };

      // Use fetch for SSE streaming (axios doesn't support streams well)
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/briefs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Failed to generate brief' } }));
        throw new Error(errorData.error?.message || 'Failed to generate brief');
      }

      // Parse SSE stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let result: any = {
        headlines: [],
        body_copy: [],
        ctas: [],
        email_subjects: [],
        taglines: [],
        word_count: 0,
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.substring(6));

              // Handle progress events
              if (eventData.step && eventData.progress) {
                setProgress(eventData.progress);
              }

              // Handle complete event - this contains the actual AI result
              if (eventData.headlines || eventData.body_copy) {
                result = eventData;
              }
            } catch (e) {
              console.warn('Failed to parse SSE event:', e);
            }
          }
        }
      }

      // Create brief object
      const generatedBrief: GeneratedBrief = {
        title: data.campaign_name,
        objectives: data.objectives,
        target_audience: data.target_audience,
        ai_generated_copy: result,
        status: 'completed',
      };

      setBrief(generatedBrief);

      // Save brief to database asynchronously
      try {
        await api.briefs.save({
          title: data.campaign_name,
          objectives: data.objectives,
          target_audience: data.target_audience,
          ai_generated_copy: result,
          status: 'completed',
        });
      } catch (saveError) {
        console.error('Failed to save brief:', saveError);
      }
    } catch (err: any) {
      console.error('Brief generation failed:', err);
      setError(err.message || 'Failed to generate brief');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  const saveBrief = useCallback(async (briefData: GeneratedBrief) => {
    try {
      await api.briefs.save(briefData);
    } catch (err: any) {
      console.error('Save brief failed:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to save brief');
    }
  }, []);

  const clearBrief = useCallback(() => {
    setBrief(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    brief,
    isGenerating,
    progress,
    error,
    submitBrief,
    saveBrief,
    clearBrief,
  };
}

export default useBriefBuilder;
