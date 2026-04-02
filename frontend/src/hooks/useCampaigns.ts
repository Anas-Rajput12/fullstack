import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface Campaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
  conversions: number;
  start_date: string;
  end_date: string | null;
}

interface UseCampaignsResult {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: (filters?: CampaignFilters) => Promise<void>;
  createCampaign: (data: Partial<Campaign>) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

interface CampaignFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
}

export function useCampaigns(): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (filters?: CampaignFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.campaigns.list(filters);
      setCampaigns(response.data.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
      setError(err.response?.data?.error?.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (data: Partial<Campaign>) => {
    try {
      await api.campaigns.create(data);
      await fetchCampaigns();
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to create campaign');
    }
  }, [fetchCampaigns]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    try {
      await api.campaigns.update(id, data);
      await fetchCampaigns();
    } catch (err: any) {
      console.error('Failed to update campaign:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to update campaign');
    }
  }, [fetchCampaigns]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      await api.campaigns.delete(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error('Failed to delete campaign:', err);
      throw new Error(err.response?.data?.error?.message || 'Failed to delete campaign');
    }
  }, []);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}

export default useCampaigns;
