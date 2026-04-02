import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import ThemeToggle from '../components/common/ThemeToggle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCampaigns, Campaign } from '../hooks/useCampaigns';
import { useTheme } from '../hooks/useTheme';
import { format, subDays } from 'date-fns';

const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { campaigns, isLoading, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Campaign>('start_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'draft' as Campaign['status'],
    budget: 0,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filteredCampaigns = campaigns
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

  const handleOpenModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget,
        spent: campaign.spent,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        conversions: campaign.conversions,
        start_date: campaign.start_date,
        end_date: campaign.end_date || '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        status: 'draft',
        budget: 0,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, formData);
      } else {
        await createCampaign(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save campaign:', error);
      alert('Failed to save campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        alert('Failed to delete campaign');
      }
    }
  };

  const handleSort = (field: keyof Campaign) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return classes[status] || classes.draft;
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    paused: campaigns.filter((c) => c.status === 'paused').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-20'}`}>
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
              Campaigns
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => handleOpenModal()} 
              className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap"
            >
              <span className="hidden sm:inline">+ </span>New Campaign
            </button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Campaigns</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
            </div>
            <div className="card p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Active</h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="card p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Paused</h3>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-2">{stats.paused}</p>
            </div>
            <div className="card p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Draft</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-600 mt-2">{stats.draft}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm sm:w-48"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Campaign Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Campaign Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('budget')}
                      className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Budget {sortBy === 'budget' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Spent
                    </th>
                    <th
                      onClick={() => handleSort('ctr')}
                      className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        CTR {sortBy === 'ctr' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('conversions')}
                      className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Conversions {sortBy === 'conversions' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <LoadingSpinner size="lg" />
                      </td>
                    </tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="font-medium">No campaigns found</p>
                        <p className="text-sm mt-1">Create your first campaign to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{campaign.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(campaign.start_date).toLocaleDateString()}
                            {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`badge ${getStatusBadgeClass(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                          ${campaign.budget.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                          ${campaign.spent.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm">
                          <span className={`font-semibold ${campaign.ctr !== null && campaign.ctr !== undefined && Number(campaign.ctr) < 1 ? 'text-red-600' : 'text-green-600'}`}>
                            {campaign.ctr !== null && campaign.ctr !== undefined ? `${(Number(campaign.ctr) < 1 ? Number(campaign.ctr) * 100 : Number(campaign.ctr)).toFixed(2)}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {campaign.conversions.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(campaign)}
                              className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(campaign.id)}
                              className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Summer Campaign 2024"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Campaign['status'] })}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Impressions
                  </label>
                  <input
                    type="number"
                    value={formData.impressions}
                    onChange={(e) => setFormData({ ...formData, impressions: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clicks
                  </label>
                  <input
                    type="number"
                    value={formData.clicks}
                    onChange={(e) => setFormData({ ...formData, clicks: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conversions
                  </label>
                  <input
                    type="number"
                    value={formData.conversions}
                    onChange={(e) => setFormData({ ...formData, conversions: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={handleCloseModal} className="btn-secondary w-full sm:w-auto">
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  {editingCampaign ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
