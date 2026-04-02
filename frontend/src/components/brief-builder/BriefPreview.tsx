import React, { useState } from 'react';

interface BriefPreviewProps {
  brief: {
    title: string;
    objectives: string;
    target_audience: string;
    ai_generated_copy?: {
      headlines: string[];
      body_copy: string[];
      ctas: string[];
      email_subjects: string[];
      taglines: string[];
    };
    social_posts?: {
      facebook?: any[];
      twitter?: any[];
      linkedin?: any[];
      instagram?: any[];
    };
    hashtags?: {
      trending: string[];
      niche: string[];
      branded: string[];
      campaign_specific: string[];
    };
  };
  onEdit?: (section: string, content: any) => void;
  isEditing?: boolean;
}

const BriefPreview: React.FC<BriefPreviewProps> = ({
  brief,
  onEdit,
  isEditing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'copy' | 'social' | 'hashtags'>('copy');

  const tabs = [
    { id: 'copy', label: 'Copy', icon: '📝' },
    { id: 'social', label: 'Social Posts', icon: '📱' },
    { id: 'hashtags', label: 'Hashtags', icon: '#️⃣' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'copy':
        return (
          <div className="space-y-6">
            {/* Headlines */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Headlines
                </h3>
                {isEditing && (
                  <button
                    onClick={() =>
                      onEdit?.('headlines', brief.ai_generated_copy?.headlines || [])
                    }
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {brief.ai_generated_copy?.headlines?.map((headline, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-gray-900 dark:text-white font-medium">
                      {headline}
                    </p>
                  </div>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No headlines generated
                  </p>
                )}
              </div>
            </section>

            {/* Body Copy */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Body Copy
                </h3>
                {isEditing && (
                  <button
                    onClick={() =>
                      onEdit?.('body_copy', brief.ai_generated_copy?.body_copy || [])
                    }
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {brief.ai_generated_copy?.body_copy?.map((copy, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {copy}
                    </p>
                  </div>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No body copy generated
                  </p>
                )}
              </div>
            </section>

            {/* CTAs */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Call-to-Actions
                </h3>
                {isEditing && (
                  <button
                    onClick={() => onEdit?.('ctas', brief.ai_generated_copy?.ctas || [])}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {brief.ai_generated_copy?.ctas?.map((cta, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    {cta}
                  </span>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No CTAs generated
                  </p>
                )}
              </div>
            </section>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            {/* Facebook */}
            {brief.social_posts?.facebook && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Facebook
                </h3>
                <div className="space-y-3">
                  {brief.social_posts.facebook.map((post, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-gray-900 dark:text-white mb-2">{post.text}</p>
                      {post.image_suggestion && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📷 {post.image_suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Twitter */}
            {brief.social_posts?.twitter && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Twitter
                </h3>
                <div className="space-y-3">
                  {brief.social_posts.twitter.map((post, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-gray-900 dark:text-white mb-2">{post.text}</p>
                      {post.hashtags && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {post.hashtags.join(' ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* LinkedIn */}
            {brief.social_posts?.linkedin && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  LinkedIn
                </h3>
                <div className="space-y-3">
                  {brief.social_posts.linkedin.map((post, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-gray-900 dark:text-white whitespace-pre-line">
                        {post.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Instagram */}
            {brief.social_posts?.instagram && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Instagram
                </h3>
                <div className="space-y-3">
                  {brief.social_posts.instagram.map((post, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-gray-900 dark:text-white mb-2">{post.caption}</p>
                      {post.hashtags && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {post.hashtags.join(' ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );

      case 'hashtags':
        return (
          <div className="space-y-6">
            {/* Trending */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Trending Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {brief.hashtags?.trending?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No trending hashtags
                  </p>
                )}
              </div>
            </section>

            {/* Niche */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Niche Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {brief.hashtags?.niche?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No niche hashtags
                  </p>
                )}
              </div>
            </section>

            {/* Branded */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Branded Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {brief.hashtags?.branded?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                )) || (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No branded hashtags
                  </p>
                )}
              </div>
            </section>
          </div>
        );

      default:
      return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {brief.title || 'Creative Brief'}
        </h2>
        <div className="mt-4 space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Objectives:
            </span>
            <p className="text-gray-900 dark:text-white">{brief.objectives}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Target Audience:
            </span>
            <p className="text-gray-900 dark:text-white">{brief.target_audience}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
};

export default BriefPreview;
