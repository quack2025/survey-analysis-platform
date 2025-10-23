'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { ProjectConfig, StudyType, StudyPhase } from '@/types';

export default function SetupPage() {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<Partial<ProjectConfig>>({
    name: '',
    projectContext: {
      studyType: 'commercial_evaluation',
      studyPhase: 'exploratory',
      analysisType: 'theme_analysis',
      brand: '',
      objective: '',
      targetAudience: '',
      competitiveSet: [],
    },
    taxonomyPreferences: {
      useIndustryStandard: true,
      customDimensions: [],
      sentimentGranularity: '3-level',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save to localStorage for now (later: save to database)
    localStorage.setItem('projectConfig', JSON.stringify(config));

    // Navigate to upload page
    router.push('/upload');
  };

  const studyTypes: { value: StudyType; label: string; description: string }[] = [
    {
      value: 'commercial_evaluation',
      label: 'Commercial Evaluation',
      description: 'Analyze effectiveness of TV/digital ads, messaging, and creative execution',
    },
    {
      value: 'product_feedback',
      label: 'Product Feedback',
      description: 'Collect opinions on product performance, features, and user experience',
    },
    {
      value: 'concept_test',
      label: 'Concept Test',
      description: 'Evaluate new product/service concepts for appeal and purchase intent',
    },
    {
      value: 'brand_health',
      label: 'Brand Health',
      description: 'Measure brand awareness, perception, and competitive positioning',
    },
    {
      value: 'ux_research',
      label: 'UX Research',
      description: 'Understand usability, pain points, and user satisfaction',
    },
    {
      value: 'customer_satisfaction',
      label: 'Customer Satisfaction',
      description: 'Measure satisfaction with products, services, and support',
    },
    {
      value: 'custom',
      label: 'Custom Study',
      description: 'Define your own framework for specialized research',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configure Your Project
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Provide context about your study so the AI can deliver more accurate analysis.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                required
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Q1 2024 Brand Campaign"
              />
            </div>

            {/* Study Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Type
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {studyTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      config.projectContext?.studyType === type.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="studyType"
                      value={type.value}
                      checked={config.projectContext?.studyType === type.value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          projectContext: {
                            ...config.projectContext!,
                            studyType: e.target.value as StudyType,
                          },
                        })
                      }
                      className="sr-only"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white mb-1">
                      {type.label}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand/Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand / Product Name
              </label>
              <input
                type="text"
                required
                value={config.projectContext?.brand}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    projectContext: { ...config.projectContext!, brand: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Acme Energy Drink"
              />
            </div>

            {/* Study Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Objective
              </label>
              <textarea
                required
                rows={3}
                value={config.projectContext?.objective}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    projectContext: { ...config.projectContext!, objective: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Evaluate message clarity and emotional impact of new TV commercial"
              />
            </div>

            {/* Study Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Phase
              </label>
              <select
                value={config.projectContext?.studyPhase}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    projectContext: {
                      ...config.projectContext!,
                      studyPhase: e.target.value as StudyPhase,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="exploratory">Exploratory</option>
                <option value="validation">Validation</option>
                <option value="optimization">Optimization</option>
                <option value="tracking">Tracking</option>
              </select>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience (Optional)
                    </label>
                    <input
                      type="text"
                      value={config.projectContext?.targetAudience}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          projectContext: {
                            ...config.projectContext!,
                            targetAudience: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Millennials, urban professionals"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.taxonomyPreferences?.useIndustryStandard}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            taxonomyPreferences: {
                              ...config.taxonomyPreferences!,
                              useIndustryStandard: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Use industry-standard frameworks for categorization
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue to Upload Data →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
