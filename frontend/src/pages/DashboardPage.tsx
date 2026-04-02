import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import ThemeToggle from '../components/common/ThemeToggle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import KpiCard from '../components/dashboard/KpiCard';
import CampaignTable from '../components/dashboard/CampaignTable';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import DateRangePicker, { DateRange } from '../components/dashboard/DateRangePicker';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { useCampaigns } from '../hooks/useCampaigns';
import { useTheme } from '../hooks/useTheme';
import { useAlerts } from '../hooks/useAlerts';
import { subDays, format, eachDayOfInterval } from 'date-fns';

interface ChartDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

const DashboardPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { campaigns, isLoading, fetchCampaigns } = useCampaigns();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    // Fetch all campaigns without date filtering for KPIs and table
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Fetch chart data based on date range
  useEffect(() => {
    const fetchChartData = async () => {
      setIsChartLoading(true);
      try {
        const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
        const data: ChartDataPoint[] = days.map((day) => ({
          date: format(day, 'yyyy-MM-dd'),
          impressions: Math.floor(Math.random() * 100000) + 50000,
          clicks: Math.floor(Math.random() * 5000) + 2000,
          conversions: Math.floor(Math.random() * 500) + 100,
        }));
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchChartData();
  }, [dateRange]);

  // Calculate KPIs from campaigns
  const kpis = {
    totalCampaigns: campaigns.length,
    totalBudget: campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0),
    totalSpent: campaigns.reduce((sum, c) => sum + Number(c.spent || 0), 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + Number(c.impressions || 0), 0),
    totalClicks: campaigns.reduce((sum, c) => sum + Number(c.clicks || 0), 0),
    totalConversions: campaigns.reduce((sum, c) => sum + Number(c.conversions || 0), 0),
    avgCtr:
      campaigns.length > 0
        ? campaigns.reduce((sum, c) => {
            // CTR from backend is already a percentage (e.g., 2.5 for 2.5%)
            const ctrValue = c.ctr !== null && c.ctr !== undefined ? Number(c.ctr) : 0;
            // If CTR is less than 1, assume it's a decimal and convert to percentage
            return sum + (ctrValue < 1 ? ctrValue * 100 : ctrValue);
          }, 0) / campaigns.length
        : 0,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-20'
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-target"
              aria-label="Toggle sidebar"
            >
              <span className="text-xl sm:text-2xl">☰</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationCenter />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Date Range Picker */}
          <div className="overflow-x-auto">
            <DateRangePicker
              initialRange={dateRange}
              onRangeChange={setDateRange}
            />
          </div>

          {/* KPI Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <KpiCard key={i} title="Loading" value={0} isLoading />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <KpiCard
                title="Total Campaigns"
                value={kpis.totalCampaigns}
                icon="📊"
                color="blue"
              />
              <KpiCard
                title="Total Budget"
                value={`$${(kpis.totalBudget / 1000).toFixed(0)}K`}
                icon="💰"
                color="green"
              />
              <KpiCard
                title="Total Spent"
                value={`$${(kpis.totalSpent / 1000).toFixed(0)}K`}
                icon="💸"
                color="yellow"
                change={kpis.totalBudget > 0 ? ((kpis.totalSpent / kpis.totalBudget) * 100 - 80) : 0}
              />
              <KpiCard
                title="Avg CTR"
                value={`${kpis.avgCtr.toFixed(2)}%`}
                icon="🎯"
                color="purple"
                change={kpis.avgCtr - 1.5}
              />
            </div>
          )}

          {/* Performance Chart */}
          <PerformanceChart
            data={chartData}
            isLoading={isChartLoading}
            metrics={['impressions', 'clicks']}
            title="Performance Trends"
          />

          {/* Campaign Table */}
          <CampaignTable
            campaigns={campaigns}
            isLoading={isLoading}
            onEdit={(id) => console.log('Edit campaign:', id)}
            onDelete={(id) => console.log('Delete campaign:', id)}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
