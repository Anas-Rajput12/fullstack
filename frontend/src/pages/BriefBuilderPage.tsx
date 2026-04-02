import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import ThemeToggle from '../components/common/ThemeToggle';
import StepForm, { BriefFormData } from '../components/brief-builder/StepForm';
import BriefPreview from '../components/brief-builder/BriefPreview';
import PdfExport from '../components/brief-builder/PdfExport';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTheme } from '../hooks/useTheme';
import { useBriefBuilder } from '../hooks/useBriefBuilder';

const BriefBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form');

  const {
    brief,
    isGenerating,
    progress,
    error,
    submitBrief,
    clearBrief,
  } = useBriefBuilder();

  const handleEdit = (section: string, content: any) => {
    console.log('Edit section:', section, content);
  };

  const handleExportComplete = () => {
    console.log('PDF exported successfully');
  };

  const handleNewBrief = () => {
    clearBrief();
    setCurrentStep('form');
  };

  const handleSubmit = async (data: BriefFormData) => {
    await submitBrief(data);
    if (brief) {
      setCurrentStep('preview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-0 lg:ml-72' : 'ml-0 lg:ml-20'
        }`}
      >
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
              AI Brief Builder
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={handleNewBrief} className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap">
              New Brief
            </button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {currentStep === 'form' && !brief ? (
            <>
              {isGenerating && (
                <div className="card p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <LoadingSpinner size="md" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Generating AI Brief...
                    </h2>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {progress < 25 && 'Analyzing campaign objectives...'}
                    {progress >= 25 && progress < 50 && 'Generating headlines...'}
                    {progress >= 50 && progress < 75 && 'Writing body copy...'}
                    {progress >= 75 && 'Finalizing content...'}
                  </p>
                  {error && (
                    <div className="mt-4 p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}

              <StepForm onSubmit={handleSubmit} isGenerating={isGenerating} />
            </>
          ) : (
            <>
              {brief && (
                <div className="space-y-4 sm:space-y-6">
                  <BriefPreview
                    brief={brief}
                    onEdit={handleEdit}
                    isEditing={true}
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => setCurrentStep('form')}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      ← Back to Form
                    </button>
                    <PdfExport brief={brief} onExportComplete={handleExportComplete} />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BriefBuilderPage;
