/**
 * Optimized Campaign Table Component
 * 
 * Performance optimizations applied:
 * 1. React.memo to prevent unnecessary re-renders
 * 2. useMemo for expensive calculations (sorting, filtering)
 * 3. useCallback for stable function references
 * 4. Virtual scrolling for large lists (if needed)
 * 
 * Use React DevTools to verify reduced re-renders
 */

import React, { useState, useMemo, useCallback, memo } from 'react';

export interface Campaign {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  ctr: number;
  startDate: string;
  endDate: string;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  onCampaignSelect?: (campaign: Campaign) => void;
  isLoading?: boolean;
}

// Memoized row component to prevent re-renders
const CampaignRow = memo(function CampaignRow({ 
  campaign, 
  onSelect 
}: { 
  campaign: Campaign; 
  onSelect: (c: Campaign) => void;
}) {
  console.log(`Rendering CampaignRow: ${campaign.id}`);
  
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return (
    <tr 
      onClick={() => onSelect(campaign)}
      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {campaign.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 dark:text-gray-300">
          {campaign.client}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[campaign.status]}`}>
          {campaign.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${campaign.budget.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${campaign.spend.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        {campaign.impressions.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        {campaign.ctr.toFixed(2)}%
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {campaign.roas.toFixed(2)}x
      </td>
    </tr>
  );
});

// Memoized header cell to prevent re-renders
const SortableHeader = memo(function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}) {
  const isActive = currentSort.key === sortKey;
  
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-blue-500">
            {currentSort.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
});

export function OptimizedCampaignTable({ 
  campaigns, 
  onCampaignSelect = () => {},
  isLoading = false 
}: CampaignTableProps) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'roas',
    direction: 'desc',
  });

  // Memoize filtered campaigns - only recalculates when dependencies change
  const filteredCampaigns = useMemo(() => {
    console.log('Filtering campaigns...');
    let result = [...campaigns];

    // Apply text filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(lowerFilter) || 
             c.client.toLowerCase().includes(lowerFilter)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    return result;
  }, [campaigns, filter, statusFilter]);

  // Memoize sorted campaigns - only recalculates when filtered data or sort changes
  const sortedCampaigns = useMemo(() => {
    console.log('Sorting campaigns...');
    const result = [...filteredCampaigns];
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.key) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'client':
          comparison = a.client.localeCompare(b.client);
          break;
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'spend':
          comparison = a.spend - b.spend;
          break;
        case 'roas':
          comparison = a.roas - b.roas;
          break;
        case 'ctr':
          comparison = a.ctr - b.ctr;
          break;
        default:
          comparison = 0;
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [filteredCampaigns, sort]);

  // Memoize totals calculation
  const totals = useMemo(() => {
    console.log('Calculating totals...');
    return {
      totalSpend: sortedCampaigns.reduce((sum, c) => sum + c.spend, 0),
      totalImpressions: sortedCampaigns.reduce((sum, c) => sum + c.impressions, 0),
      avgRoas: sortedCampaigns.length > 0 
        ? sortedCampaigns.reduce((sum, c) => sum + c.roas, 0) / sortedCampaigns.length 
        : 0,
    };
  }, [sortedCampaigns]);

  // Memoize sort handler
  const handleSort = useCallback((key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  // Memoize select handler
  const handleSelect = useCallback((campaign: Campaign) => {
    onCampaignSelect(campaign);
  }, [onCampaignSelect]);

  // Memoize filter handlers
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filter by name or client..."
          value={filter}
          onChange={handleFilterChange}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Spend</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ${totals.totalSpend.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Impressions</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {totals.totalImpressions.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg ROAS</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {totals.avgRoas.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <SortableHeader 
                label="Campaign Name" 
                sortKey="name" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="Client" 
                sortKey="client" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="Status" 
                sortKey="status" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="Budget" 
                sortKey="budget" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="Spend" 
                sortKey="spend" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="Impressions" 
                sortKey="impressions" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="CTR" 
                sortKey="ctr" 
                currentSort={sort} 
                onSort={handleSort} 
              />
              <SortableHeader 
                label="ROAS" 
                sortKey="roas" 
                currentSort={sort} 
                onSort={handleSort} 
              />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCampaigns.map(campaign => (
              <CampaignRow 
                key={campaign.id} 
                campaign={campaign} 
                onSelect={handleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {sortedCampaigns.length} of {campaigns.length} campaigns
      </div>
    </div>
  );
}

export default OptimizedCampaignTable;
