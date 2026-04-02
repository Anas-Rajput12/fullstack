import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface StepFormProps {
  onSubmit: (data: BriefFormData) => Promise<void>;
  isGenerating?: boolean;
}

export interface BriefFormData {
  campaign_name: string;
  client_name: string;
  industry: string;
  objectives: string;
  target_audience: string;
  key_messages: string[];
  brand_voice: 'professional' | 'casual' | 'urgent' | 'friendly';
  products: string[];
  tone: string;
}

const StepForm: React.FC<StepFormProps> = ({ onSubmit, isGenerating = false }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BriefFormData>({
    campaign_name: '',
    client_name: '',
    industry: '',
    objectives: '',
    target_audience: '',
    key_messages: [''],
    brand_voice: 'professional',
    products: [''],
    tone: 'professional',
  });

  const steps = [
    { title: 'Campaign Info', icon: '📋' },
    { title: 'Objectives', icon: '🎯' },
    { title: 'Audience', icon: '👥' },
    { title: 'Creative', icon: '✨' },
    { title: 'Review', icon: '✅' },
  ];

  const handleInputChange = (field: keyof BriefFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'key_messages' | 'products', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'key_messages' | 'products') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'key_messages' | 'products', index: number) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, [field]: newArray }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.campaign_name && formData.client_name && formData.industry);
      case 1:
        return formData.objectives.length >= 50;
      case 2:
        return formData.target_audience.length >= 50;
      case 3:
        return formData.key_messages.some((m) => m.trim().length > 0);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await onSubmit(formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.campaign_name}
                onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                className="input"
                placeholder="e.g., Summer Product Launch 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                className="input"
                placeholder="e.g., Acme Corporation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="input"
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="education">Education</option>
                <option value="hospitality">Hospitality</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Objectives * (min 50 characters)
              </label>
              <textarea
                value={formData.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                className="textarea min-h-[150px]"
                placeholder="Describe what you want to achieve with this campaign. Include specific goals, KPIs, and desired outcomes..."
                rows={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.objectives.length}/50 characters minimum
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand Voice
              </label>
              <select
                value={formData.brand_voice}
                onChange={(e) => handleInputChange('brand_voice', e.target.value)}
                className="input"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="urgent">Urgent</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience * (min 50 characters)
              </label>
              <textarea
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                className="textarea min-h-[150px]"
                placeholder="Describe your ideal customer. Include demographics, psychographics, pain points, and motivations..."
                rows={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.target_audience.length}/50 characters minimum
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Messages
              </label>
              {formData.key_messages.map((message, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => handleArrayChange('key_messages', index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Key message ${index + 1}`}
                  />
                  <button
                    onClick={() => removeArrayItem('key_messages', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                    disabled={formData.key_messages.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('key_messages')}
                className="btn-secondary text-sm"
              >
                + Add Message
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Products/Services
              </label>
              {formData.products.map((product, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => handleArrayChange('products', index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Product ${index + 1}`}
                  />
                  <button
                    onClick={() => removeArrayItem('products', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                    disabled={formData.products.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('products')}
                className="btn-secondary text-sm"
              >
                + Add Product
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Campaign</h4>
                <p className="text-gray-600 dark:text-gray-400">{formData.campaign_name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Client</h4>
                <p className="text-gray-600 dark:text-gray-400">{formData.client_name} ({formData.industry})</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Objectives</h4>
                <p className="text-gray-600 dark:text-gray-400">{formData.objectives}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Target Audience</h4>
                <p className="text-gray-600 dark:text-gray-400">{formData.target_audience}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Key Messages</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {formData.key_messages.filter(m => m.trim()).map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index !== steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index <= currentStep
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                <span className="text-sm sm:text-xl">{step.icon}</span>
              </div>
              <span
                className={`ml-2 text-xs sm:text-sm font-medium hidden lg:block whitespace-nowrap ${
                  index <= currentStep
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 sm:h-1 mx-2 sm:mx-4 ${
                    index < currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isGenerating}
          className="btn-secondary disabled:opacity-50 w-full sm:w-auto"
        >
          ← Back
        </button>
        {currentStep === steps.length - 1 ? (
          <button onClick={handleSubmit} disabled={isGenerating} className="btn-primary disabled:opacity-50 w-full sm:w-auto">
            {isGenerating ? 'Generating...' : '✨ Generate Brief'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!validateStep(currentStep) || isGenerating}
            className="btn-primary disabled:opacity-50 w-full sm:w-auto"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default StepForm;
